const express = require("express");
const path = require("path");
const Student = require("../models/Student");
const {
  flattenQuestionBank,
  getInitialRating,
  getRatingBand,
  selectNextQuestion,
  updateAdaptiveState,
} = require("../services/marsAdaptiveEngine");

const router = express.Router();

async function loadQuestionBank() {
  const bankPath = path.resolve(__dirname, "../../question_bank/index.js");
  return import(`file://${bankPath}`);
}

router.get("/questions/:className", async (req, res) => {
  try {
    const bankModule = await loadQuestionBank();
    const questions = flattenQuestionBank(bankModule, req.params.className);
    const ratingBand = getRatingBand(req.params.className);
    const studentId = String(req.query.studentId || "").trim();
    let currentRating = getInitialRating(req.params.className);

    if (studentId) {
      const student = await Student.findOne({ studentId });
      currentRating = student?.adaptiveRating?.rating || currentRating;
    }

    res.status(200).json({
      className: req.params.className,
      ratingBand,
      currentRating,
      totalQuestions: questions.length,
      questions,
      nextQuestion: selectNextQuestion(
        questions,
        { rating: currentRating, className: req.params.className },
        []
      ),
    });
  } catch (error) {
    console.error("Adaptive question bank load failed:", error);
    res.status(500).json({ error: "Failed to load adaptive question bank" });
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
        options: question.options,
        optionsHindi: question.optionsHindi,
        selectedOptionIndex: answer.selectedOptionIndex,
        correctAnswerIndex: question.correctAnswerIndex,
        isCorrect,
        hintUsed: Boolean(answer.hintUsed),
        timeSpentMs: Number(answer.timeSpentMs) || 0,
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
    student.adaptiveTestAttempts.push({
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
    });

    await student.save();

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
