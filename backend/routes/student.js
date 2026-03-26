const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Question = require("../models/Question");
const Quiz = require("../models/Quiz");
const { ensureRecordWithBootstrap } = require("../sync/bootstrapGuard");
const { repairLocalPasswordFromAtlas } = require("../sync/authPasswordRepair");

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
    const { studentId, password } = req.body;

    // Check for missing fields
    if (!studentId || !password) {
      return res
        .status(400)
        .json({ error: "Student ID and password are required" });
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
    let isPasswordValid = await student.comparePassword(password);

    if (!isPasswordValid) {
      const repaired = await repairLocalPasswordFromAtlas({
        model: Student,
        lookupQuery: { studentId },
        candidatePassword: password,
      });

      if (repaired) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid student ID or password" });
    }

    // Login successful
    res.status(200).json({
      message: "Login successful",
      student
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
    const student = await Student.findOne({ studentId: req.params.id });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(student);
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
router.delete("/:id", async (req, res) => {
  try {
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


module.exports = router;
