const express = require("express");
const Student = require("../models/Student");
const { loadLocalQuestionBank } = require("../utils/localQuestionBank");
const {
  flattenQuestionBank,
  getInitialRating,
  getRatingBand,
  selectNextQuestion,
  updateAdaptiveState,
} = require("../services/marsAdaptiveEngine");

const router = express.Router();

function loadAdaptiveQuestions(bankModule, requestedClassName) {
  const requestedClass = String(requestedClassName || "10");
  const preferredClasses = [
    requestedClass,
    "10",
    "7",
    "6",
    "8",
    "9",
  ].filter((value, index, list) => list.indexOf(value) === index);

  for (const className of preferredClasses) {
    const questions = flattenQuestionBank(bankModule, className);
    if (questions.length > 0) {
      return { className, questions };
    }
  }

  return { className: requestedClass, questions: [] };
}

router.get("/questions/:className", async (req, res) => {
  try {
    const bankModule = loadLocalQuestionBank();
    const loaded = loadAdaptiveQuestions(bankModule, req.params.className);
    const questions = loaded.questions;
    const ratingBand = getRatingBand(loaded.className);
    const studentId = String(req.query.studentId || "").trim();
    let currentRating = getInitialRating(loaded.className);

    let correctlyAnsweredIds = new Set();
    let wronglyAnsweredIds = new Set();

    if (studentId) {
      const student = await Student.findOne({ studentId });
      if (student) {
        currentRating = student.adaptiveRating?.rating || currentRating;
        (student.adaptiveTestAttempts || []).forEach(attempt => {
          (attempt.answers || []).forEach(ans => {
             if (ans.isCorrect) {
                 correctlyAnsweredIds.add(ans.questionId);
                 wronglyAnsweredIds.delete(ans.questionId);
             } else if (ans.isCorrect === false) {
                 wronglyAnsweredIds.add(ans.questionId);
                 correctlyAnsweredIds.delete(ans.questionId);
             }
          });
        });
      }
    }

    const filteredQuestions = questions.filter(q => !correctlyAnsweredIds.has(q.id));
    const wronglyAnsweredArray = Array.from(wronglyAnsweredIds);

    res.status(200).json({
      className: loaded.className,
      requestedClassName: req.params.className,
      ratingBand,
      currentRating,
      totalQuestions: filteredQuestions.length,
      questions: filteredQuestions,
      wronglyAnsweredIds: wronglyAnsweredArray,
      nextQuestion: selectNextQuestion(
        filteredQuestions,
        { rating: currentRating, className: loaded.className },
        [],
        wronglyAnsweredArray
      ),
    });
  } catch (error) {
    console.error("Adaptive question bank load failed:", error);
    res.status(500).json({ error: "Failed to load adaptive question bank" });
  }
});

// Class-scoped leaderboard: top adaptive ratings within the caller's school and
// grade only (global leaderboard is a later enhancement). Grade is resolved from
// the legacy `class` field, falling back to the batch (class = 2038 − batch).
router.get("/leaderboard", async (req, res) => {
  try {
    const schoolId = String(req.query.schoolId || "").trim();
    const requestedClass = Number.parseInt(String(req.query.classNumber || ""), 10);
    if (!schoolId) return res.status(400).json({ error: "schoolId is required" });

    const students = await Student.find({ schoolId })
      .select("studentId name class batch adaptiveRating adaptiveTestAttempts")
      .lean();

    const batchToClass = (batch) => {
      const n = Number.parseInt(String(batch || "").replace(/\D/g, ""), 10);
      const derived = Number.isFinite(n) && n >= 2026 && n <= 2037 ? 2038 - n : null;
      return derived >= 6 && derived <= 10 ? derived : null;
    };
    const derivedClass = (s) => {
      const c = Number.parseInt(String(s.class || "").replace(/\D/g, ""), 10);
      return Number.isFinite(c) && c >= 6 && c <= 10 ? c : batchToClass(s.batch);
    };

    const leaderboard = students
      .filter((s) => s.adaptiveRating && typeof s.adaptiveRating.rating === "number")
      .filter((s) => !Number.isFinite(requestedClass) || derivedClass(s) === requestedClass)
      .map((s) => ({
        studentId: s.studentId,
        name: s.name || s.studentId,
        rating: Math.round(s.adaptiveRating.rating),
        // Tests completed (not the internal per-question rating counter).
        testsTaken: Array.isArray(s.adaptiveTestAttempts) ? s.adaptiveTestAttempts.length : 0,
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 20);

    res.status(200).json({
      schoolId,
      classNumber: Number.isFinite(requestedClass) ? requestedClass : null,
      leaderboard,
    });
  } catch (error) {
    console.error("Adaptive leaderboard failed:", error);
    res.status(500).json({ error: "Failed to load adaptive leaderboard" });
  }
});

// Fetch one past adaptive-test attempt (for the history -> review-answers page).
router.get("/attempt/:studentId/:attemptId", async (req, res) => {
  try {
    const { studentId, attemptId } = req.params;
    const student = await Student.findOne(
      { studentId },
      { adaptiveTestAttempts: { $elemMatch: { _id: attemptId } } }
    ).lean();

    const attempt = student?.adaptiveTestAttempts?.[0];
    if (!attempt) {
      return res.status(404).json({ error: "Adaptive test attempt not found" });
    }

    res.status(200).json({ attempt });
  } catch (error) {
    console.error("Adaptive attempt fetch failed:", error);
    res.status(500).json({ error: "Failed to load adaptive test attempt" });
  }
});

router.post("/submit", async (req, res) => {
  try {
    const { studentId, className, answers = [], startedAt } = req.body;
    if (!studentId || !className) {
      return res.status(400).json({ error: "studentId and className are required" });
    }

    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const initialRating = student.adaptiveRating?.rating || getInitialRating(className);
    let state = {
      rating: initialRating,
      velocity: student.adaptiveRating?.velocity || 0,
      attempts: student.adaptiveRating?.attempts || 0,
      streak: student.adaptiveRating?.streak || 0,
      variance: student.adaptiveRating?.variance || 100,
      recentOutcomes: student.adaptiveRating?.recentOutcomes || [],
      recentAccuracy: 0.7,
      className,
    };

    const topicStats = new Map();
    const review = answers.map((answer) => {
      const question = answer.question;
      const isCorrect = Number(answer.selectedOptionIndex) === Number(question.correctAnswerIndex);
      const nextState = updateAdaptiveState(state, {
        className,
        question,
        isCorrect,
        timeSpentMs: Number(answer.timeSpentMs) || 0,
        hintUsed: Boolean(answer.hintUsed),
      });

      const stats = topicStats.get(question.topicId) || { correct: 0, total: 0 };
      stats.total += 1;
      stats.correct += isCorrect ? 1 : 0;
      topicStats.set(question.topicId, stats);
      state = { ...nextState, className };

      return {
        questionId: question.id,
        question: question.question,
        questionHindi: question.questionHindi,
        questionImage: question.questionImage,
        options: question.options,
        optionsHindi: question.optionsHindi,
        selectedOptionIndex: answer.selectedOptionIndex,
        correctAnswerIndex: question.correctAnswerIndex,
        isCorrect,
        hintUsed: Boolean(answer.hintUsed),
        timeSpentMs: Number(answer.timeSpentMs) || 0,
        hints: question.hints || [],
        hintsHindi: question.hintsHindi || [],
        explanation: question.explanation,
        explanationHindi: question.explanationHindi,
        ratingBefore: nextState.ratingBefore,
        ratingAfter: nextState.rating,
        ratingChange: nextState.ratingChange,
      };
    });

    const correct = review.filter((item) => item.isCorrect).length;
    const incorrect = review.length - correct;
    const weakTopics = Array.from(topicStats.entries())
      .filter(([, stats]) => stats.total > 0 && stats.correct / stats.total < 0.4)
      .map(([topicId]) => topicId);

    student.adaptiveRating = {
      rating: state.rating,
      velocity: state.velocity,
      attempts: state.attempts,
      streak: state.streak,
      variance: state.variance,
      recentOutcomes: state.recentOutcomes,
      momentum: state.momentum,
      weakTopics,
      updatedAt: new Date(),
    };
    const newAttempt = {
      className,
      ratingBefore: initialRating,
      ratingAfter: state.rating,
      ratingChange: state.rating - initialRating,
      correct,
      incorrect,
      total: review.length,
      weakTopics,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      completedAt: new Date(),
      answers: review,
    };

    await Student.updateOne(
      { studentId },
      {
        $push: { adaptiveTestAttempts: newAttempt },
        $set: { adaptiveRating: student.adaptiveRating },
      }
    );

    res.status(200).json({
      ratingBand: getRatingBand(className),
      ratingBefore: initialRating,
      ratingAfter: state.rating,
      ratingChange: state.rating - initialRating,
      momentum: state.momentum,
      weakTopics,
      score: {
        correct,
        incorrect,
        total: review.length,
        accuracy: review.length ? Math.round((correct / review.length) * 100) : 0,
      },
      review,
    });
  } catch (error) {
    console.error("Adaptive test submit failed:", error);
    res.status(500).json({ error: "Failed to submit adaptive test" });
  }
});

module.exports = router;
