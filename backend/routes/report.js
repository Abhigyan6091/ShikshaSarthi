  const express = require("express");
  const StudentReport = require("../models/StudentReport.js");
  const QuizReport = require("../models/QuizReport.js");
  const Question = require("../models/Question.js");
  const Quiz = require("../models/Quiz.js");

  const router = express.Router();

  // Generate student + question report on quiz submission
  router.post("/submit-report", async (req, res) => {
    const { quizId, studentId, answers } = req.body;

    try {
      const quiz = await Quiz.findOne({ quizId }).populate("questions");
      if (!quiz) return res.status(404).json({ error: "Quiz not found" });

      let correct = 0,
        incorrect = 0,
        unattempted = 0;

      const studentAnswers = await Promise.all(
        quiz.questions.map(async (q) => {
          const answerObj = answers.find((a) => a.questionId === q._id.toString());
          if (!answerObj) {
            unattempted++;
            await updateQuizReport(quizId, q._id, "unattempted");
            return {
              questionId: q._id,
              selectedAnswer: null,
              isCorrect: false,
            };
          }

          const isCorrect = answerObj.selectedAnswer === q.correctAnswer;
          if (isCorrect) correct++;
          else incorrect++;

          await updateQuizReport(quizId, q._id, isCorrect ? "correct" : "incorrect");

          return {
            questionId: q._id,
            selectedAnswer: answerObj.selectedAnswer,
            isCorrect,
          };
        })
      );

      const studentReport = new StudentReport({
        quizId,
        studentId,
        correct,
        incorrect,
        unattempted,
        answers: studentAnswers,
      });

      await studentReport.save();
      res.status(201).json({ message: "Report generated" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Utility to update QuizReport stats
  async function updateQuizReport(quizId, questionId, status) {
    const quizReport = await QuizReport.findOneAndUpdate(
      { quizId },
      {},
      { upsert: true, new: true }
    );

    const questionStat = quizReport.questionStats.find(
      (stat) => stat.questionId.toString() === questionId.toString()
    );

    if (questionStat) {
      if (status === "correct") questionStat.correctCount++;
      if (status === "incorrect") questionStat.incorrectCount++;
      if (status === "unattempted") questionStat.unattemptedCount++;
    } else {
      quizReport.questionStats.push({
        questionId,
        correctCount: status === "correct" ? 1 : 0,
        incorrectCount: status === "incorrect" ? 1 : 0,
        unattemptedCount: status === "unattempted" ? 1 : 0,
      });
    }

    await quizReport.save();
  }

  // GET student performance
  router.get("/student/:studentId", async (req, res) => {
    const { studentId } = req.params;
    try {
      const reports = await StudentReport.find({ studentId, submissionStatus: { $ne: "draft" } });
      res.json(reports);
    } catch (err) {
      res.status(500).json({ error: "Error fetching student report" });
    }
  });

  // GET questionwise report for quiz
  router.get("/quiz/:quizId", async (req, res) => {
    const { quizId } = req.params; 
    try {
      const quizReport = await QuizReport.findOne({ quizId }).populate("questionStats.questionId");
      if (!quizReport) return res.status(404).json({ error: "No report for this quiz" });
      res.json(quizReport);
    } catch (err) {
      res.status(500).json({ error: "Error fetching quiz report" });
    }
  });

  // GET all student reports for a specific quiz
  router.get("/student-quiz/:quizId", async (req, res) => {
    const { quizId } = req.params;

    try {
      const reports = await StudentReport.find({ quizId, submissionStatus: { $ne: "draft" } });
      res.json(reports);
    } catch (err) {
      console.error("Error fetching student quiz reports:", err);
      res.status(500).json({ error: "Error fetching reports" });
    }
  });

  // Check if student has already submitted a specific quiz
  router.get("/student/:studentId/quiz/:quizId", async (req, res) => {
    const { studentId, quizId } = req.params;

    try {
      const existingReport = await StudentReport.findOne({ 
        quizId, 
        studentId: studentId.trim(),
        submissionStatus: { $ne: "draft" }
      });
      
      if (existingReport) {
        res.json({ 
          submitted: true, 
          reportId: existingReport._id,
          submittedAt: existingReport.createdAt,
          report: existingReport
        });
      } else {
        res.status(404).json({ submitted: false });
      }
    } catch (err) {
      console.error("Error checking quiz submission:", err);
      res.status(500).json({ error: "Error checking submission status" });
    }
  });


  module.exports = router;
