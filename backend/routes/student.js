const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Question = require("../models/Question");
const Quiz = require("../models/Quiz");
const { ensureRecordWithBootstrap } = require("../sync/bootstrapGuard");
const { requireAuth, signAuthToken } = require("../middleware/auth");
const { checkLoginRateLimit } = require("../middleware/loginRateLimiter");
const { saveBase64Media } = require("../utils/localMediaStore");

// Create a new student
router.post("/", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.post("/login", async (req, res) => {
  try {
    const studentId = typeof req.body.studentId === "string" ? req.body.studentId : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    // Check for missing fields
    if (!studentId || !password) {
      return res
        .status(400)
        .json({ error: "Student ID and password are required" });
    }

    const rateLimited = await checkLoginRateLimit(req, studentId);
    if (rateLimited) {
      return res.status(429).json(rateLimited);
    }

    // Auto-bootstrap local data if first sync has not populated the record yet.
    const student = await ensureRecordWithBootstrap(
      () => Student.findOne({ studentId }),
      { trigger: "student-login" }
    );

    // If not found
    if (!student) {
      return res.status(401).json({ error: "Invalid student ID or password" });
    }

    // Use bcrypt to compare password
    const isPasswordValid = await student.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid student ID or password" });
    }

    // Login successful
    const { password: _password, ...studentWithoutPassword } = student.toObject();
    res.status(200).json({
      message: "Login successful",
      token: signAuthToken({ id: student._id, role: "student", schoolId: student.schoolId, identifier: studentId }),
      student: {
        ...studentWithoutPassword,
        must_change_password: student.must_change_password || false
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get student by ID
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.id }).select("-password");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get computed insights/summary for a student: quiz + adaptive test history rollups,
// score trend over time, weak-topic aggregation. Read-only, defensive against
// students with zero attempts (never returns NaN).
router.get("/:id/summary", async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.id }).select("-password");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const quizAttempted = Array.isArray(student.quizAttempted) ? student.quizAttempted : [];
    const adaptiveTestAttempts = Array.isArray(student.adaptiveTestAttempts) ? student.adaptiveTestAttempts : [];

    const safePct = (correct, total) => (total > 0 ? Math.round((correct / total) * 1000) / 10 : 0);

    // Per-quiz breakdown
    const quizHistory = quizAttempted.map((q) => {
      const score = q.score || {};
      const correct = Number(score.correct) || 0;
      const incorrect = Number(score.incorrect) || 0;
      const unattempted = Number(score.unattempted) || 0;
      const total = correct + incorrect + unattempted;
      return {
        quizId: q.quizId,
        attemptMode: q.attemptMode === "group" ? "group" : "quiz",
        correct,
        incorrect,
        unattempted,
        total,
        percentage: safePct(correct, total),
        attemptedAt: q.attemptedAt || null,
      };
    });

    // Per-adaptive-test breakdown
    const adaptiveHistory = adaptiveTestAttempts.map((a) => {
      const correct = Number(a.correct) || 0;
      const total = Number(a.total) || (correct + (Number(a.incorrect) || 0));
      return {
        className: a.className || null,
        correct,
        incorrect: Number(a.incorrect) || 0,
        total,
        percentage: safePct(correct, total),
        ratingBefore: typeof a.ratingBefore === "number" ? a.ratingBefore : null,
        ratingAfter: typeof a.ratingAfter === "number" ? a.ratingAfter : null,
        ratingChange: typeof a.ratingChange === "number" ? a.ratingChange : null,
        weakTopics: Array.isArray(a.weakTopics) ? a.weakTopics : [],
        startedAt: a.startedAt || null,
        completedAt: a.completedAt || null,
      };
    });

    // Totals / overall accuracy
    const totalQuizzes = quizHistory.filter((q) => q.attemptMode !== "group").length;
    const totalGroupQuizzes = quizHistory.filter((q) => q.attemptMode === "group").length;
    const totalAdaptiveTests = adaptiveHistory.length;

    const combinedCorrect =
      quizHistory.reduce((sum, q) => sum + q.correct, 0) +
      adaptiveHistory.reduce((sum, a) => sum + a.correct, 0);
    const combinedTotal =
      quizHistory.reduce((sum, q) => sum + q.total, 0) +
      adaptiveHistory.reduce((sum, a) => sum + a.total, 0);
    const overallAccuracy = safePct(combinedCorrect, combinedTotal);

    // Chronological score trend combining both sources
    const trendPoints = [
      ...quizHistory
        .filter((q) => q.attemptedAt)
        .map((q) => ({
          date: q.attemptedAt,
          percentage: q.percentage,
          source: "quiz",
          label: q.quizId,
        })),
      ...adaptiveHistory
        .filter((a) => a.completedAt || a.startedAt)
        .map((a) => ({
          date: a.completedAt || a.startedAt,
          percentage: a.percentage,
          source: "adaptive",
          label: a.className,
        })),
    ]
      .filter((p) => p.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Weak topics rollup across adaptive test attempts (frequency count)
    const weakTopicCounts = {};
    adaptiveHistory.forEach((a) => {
      a.weakTopics.forEach((topic) => {
        if (!topic) return;
        weakTopicCounts[topic] = (weakTopicCounts[topic] || 0) + 1;
      });
    });
    const weakTopics = Object.entries(weakTopicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);

    // Subject-wise accuracy breakdown - derived from adaptive test className when
    // available (quizAttempted doesn't carry a subject field on the Student doc).
    const subjectCounts = {};
    adaptiveHistory.forEach((a) => {
      if (!a.className) return;
      if (!subjectCounts[a.className]) subjectCounts[a.className] = { correct: 0, total: 0 };
      subjectCounts[a.className].correct += a.correct;
      subjectCounts[a.className].total += a.total;
    });
    const subjectBreakdown = Object.entries(subjectCounts).map(([subject, v]) => ({
      subject,
      correct: v.correct,
      total: v.total,
      percentage: safePct(v.correct, v.total),
    }));

    res.status(200).json({
      studentId: student.studentId,
      totals: {
        totalQuizzes,
        totalGroupQuizzes,
        totalAdaptiveTests,
        overallAccuracy,
        combinedCorrect,
        combinedTotal,
      },
      adaptiveRating: student.adaptiveRating || null,
      quizHistory,
      adaptiveHistory,
      scoreTrend: trendPoints,
      weakTopics,
      subjectBreakdown,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update student by ID
router.put("/:id", async (req, res) => {
  try {
    const updated = await Student.findOneAndUpdate({ studentId: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete student by ID
router.delete("/:id", requireAuth("superadmin", "schooladmin"), async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (
      req.auth?.role === "schooladmin" &&
      req.auth.schoolId &&
      student.schoolId !== req.auth.schoolId
    ) {
      return res.status(403).json({ error: "You can delete only students from your school." });
    }

    const deleted = await Student.findOneAndUpdate(
      { studentId: req.params.id },
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/attempt-quiz", async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    const student = await Student.findOne({ studentId: req.params.id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    let correct = 0, incorrect = 0, unattempted = 0;
    const evaluatedAnswers = [];

    for (const answer of answers) {
      const quizQuestionIds = quiz.questions.map(q => q.toString());
      if (!quizQuestionIds.includes(answer.questionId.toString())) continue;

      const question = await Question.findById(answer.questionId);
      if (!question) continue;

      if (!answer.selectedAnswer || answer.selectedAnswer.trim() === "") {
        unattempted++;
        evaluatedAnswers.push({
          questionId: question._id,
          selectedAnswer: "",
          isCorrect: false
        });
      } else {
        const isCorrect = answer.selectedAnswer === question.correctAnswer;
        if (isCorrect) correct++;
        else incorrect++;

        evaluatedAnswers.push({
          questionId: question._id,
          selectedAnswer: answer.selectedAnswer,
          isCorrect
        });
      }
    }

    const score = { correct, incorrect, unattempted };

    const index = student.quizAttempted.findIndex(q => q.quizId === quizId);
    if (index !== -1) {
      student.quizAttempted[index].answers = evaluatedAnswers;
      student.quizAttempted[index].score = score;
    } else {
      student.quizAttempted.push({
        quizId,
        answers: evaluatedAnswers,
        score
      });
    }

    if (!quiz.attemptedBy.includes(student.studentId)) {
      quiz.attemptedBy.push(student.studentId);
      await quiz.save();
    }

    await student.save();
    res.status(200).json({ message: "Quiz evaluated and saved", student });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Update student profile (name, phone, email, profilePhoto)
router.patch("/:id/profile", async (req, res) => {
  try {
    const { name, phone, email, profilePhoto } = req.body;
    const updateFields = {};
    const unsetFields = {};

    if (name !== undefined && name.trim()) updateFields.name = name.trim();
    if (phone !== undefined) updateFields.phone = String(phone).trim();
    if (email !== undefined) {
      const trimmedEmail = String(email).trim();
      if (trimmedEmail && !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
        return res.status(400).json({ error: "Invalid email address" });
      }
      if (trimmedEmail) updateFields.email = trimmedEmail;
      else unsetFields.email = "";
    }
    if (profilePhoto !== undefined) {
      if (profilePhoto.startsWith("data:")) {
        const mimeMatch = profilePhoto.match(/^data:(image\/\w+);base64,/);
        if (mimeMatch) {
          const base64Data = profilePhoto;
          const ext = mimeMatch[1].split("/")[1];
          const saved = saveBase64Media({
            base64Data,
            fileName: `profile_${req.params.id}.${ext}`,
            mimeType: mimeMatch[1],
            mediaType: "images",
          });
          updateFields.profilePhoto = saved.localUrl;
        } else {
          return res.status(400).json({ error: "Invalid image format" });
        }
      } else {
        updateFields.profilePhoto = profilePhoto;
      }
    }

    if (Object.keys(updateFields).length === 0 && Object.keys(unsetFields).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const mongoUpdate = {};
    if (Object.keys(updateFields).length > 0) mongoUpdate.$set = updateFields;
    if (Object.keys(unsetFields).length > 0) mongoUpdate.$unset = unsetFields;

    const updated = await Student.findOneAndUpdate(
      { studentId: req.params.id },
      mongoUpdate,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(updated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "This email is already in use by another account." });
    }
    res.status(400).json({ error: err.message });
  }
});

// Self-service password change from the profile page (requires current password).
router.post("/:id/change-password", async (req, res) => {
  try {
    const currentPassword = typeof req.body.currentPassword === "string" ? req.body.currentPassword : "";
    const newPassword = typeof req.body.newPassword === "string" ? req.body.newPassword : "";

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters long" });
    }

    const student = await Student.findOne({ studentId: req.params.id });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const isValid = await student.comparePassword(currentPassword);
    if (!isValid) return res.status(401).json({ error: "Current password is incorrect" });

    student.password = newPassword;
    student.must_change_password = false;
    await student.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
