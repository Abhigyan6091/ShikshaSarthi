const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const Teacher = require("../models/Teacher"); // adjust the path as needed
const Question = require("../models/Question");
const StudentReport = require("../models/StudentReport");
const adaptiveTestRoutes = require("./adaptiveTest");

router.use("/adaptive-test", adaptiveTestRoutes);

// Helper: find a teacher by either their custom teacherId or MongoDB _id
async function findTeacherByIdentifier(identifier) {
  if (!identifier) return null;
  if (mongoose.isValidObjectId(identifier)) {
    const byId = await Teacher.findById(identifier);
    if (byId) return byId;
  }
  return await Teacher.findOne({ teacherId: identifier });
}

const submittedReportFilter = (quizId, studentId) => ({
  quizId,
  studentId,
  submissionStatus: { $ne: "draft" },
});

const draftReportFilter = (quizId, studentId) => ({
  quizId,
  studentId,
  submissionStatus: "draft",
});

const serializeDraftFromStudentReport = (reportDoc) => ({
  quizId: reportDoc.quizId,
  studentId: reportDoc.studentId,
  quizInfo: reportDoc.draftState?.quizInfo || {},
  currentIndex: Number(reportDoc.draftState?.currentIndex || 0),
  answers: Array.isArray(reportDoc.answers) ? reportDoc.answers : [],
  puzzleResults: reportDoc.draftState?.puzzleResults || {},
  videoAnalytics: reportDoc.draftState?.videoAnalytics || {},
  timeRemaining: Number(reportDoc.draftState?.timeRemaining || 0),
  initialTimeLimit: Number(reportDoc.draftState?.initialTimeLimit || 0),
  quizStarted: Boolean(reportDoc.draftState?.quizStarted),
  quizEnded: Boolean(reportDoc.draftState?.quizEnded),
  startedAt: reportDoc.draftState?.startedAt || reportDoc.updatedAt,
  updatedAt: reportDoc.updatedAt,
});


// Create a new quiz
router.post("/", async (req, res) => {
  try {
    const { teacherId } = req.body;

    // Validate teacherId
    const teacher = await findTeacherByIdentifier(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Create and save the quiz
    const quiz = new Quiz(req.body);
    await quiz.save();

    // Add quiz ID to teacher's quizzesCreated array
    teacher.quizzesCreated.push(quiz._id);
    await teacher.save();

    res.status(201).json(quiz);
  } catch (err) {
    console.error("Error creating quiz:", err);
    res.status(400).json({ error: err.message });
  }
});

// Get all quizzes
router.get("/", async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    // Try to populate questions (may fail if mixed ID types like puzzle IDs)
    for (const quiz of quizzes) {
      try {
        await quiz.populate("questions");
      } catch (popErr) {
        console.log(`Question populate skipped for quiz ${quiz.quizId} (mixed ID types)`);
      }
    }
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get quiz by ID
router.get("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ quizId: req.params.id });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Try to populate questions (may fail if mixed ID types like puzzle IDs)
    try {
      await quiz.populate("questions");
    } catch (popErr) {
      console.log("Question populate skipped (mixed ID types):", popErr.message);
    }

    res.status(200).json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Update quiz by ID
router.put("/:id", async (req, res) => {
  try {
    const updated = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Quiz not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update quiz by quizId (custom ID)
router.put("/update/:quizId", async (req, res) => {
  try {
    const updated = await Quiz.findOneAndUpdate(
      { quizId: req.params.quizId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updated) return res.status(404).json({ message: "Quiz not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete quiz by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Quiz.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) return res.status(404).json({ message: "Quiz not found" });
    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get quizzes created by a specific teacher
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const quizzes = await Quiz.find({ teacherId: req.params.teacherId });
    // Try to populate questions (may fail if mixed ID types like puzzle IDs)
    for (const quiz of quizzes) {
      try {
        await quiz.populate("questions");
      } catch (popErr) {
        console.log(`Question populate skipped for quiz ${quiz.quizId} (mixed ID types)`);
      }
    }
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get quizzes attempted by a specific student
router.get("/student/:studentId", async (req, res) => {
  try {
    const quizzes = await Quiz.find({ attemptedBy: req.params.studentId });
    // Try to populate questions (may fail if mixed ID types like puzzle IDs)
    for (const quiz of quizzes) {
      try {
        await quiz.populate("questions");
      } catch (popErr) {
        console.log(`Question populate skipped for quiz ${quiz.quizId} (mixed ID types)`);
      }
    }
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:quizId/custom-question", async (req, res) => {
  try {
    const { quizId } = req.params;
    const { question, questionImage, options, correctAnswer, teacherId } = req.body;

    if (!question || !options || !correctAnswer || !teacherId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newQuestion = new Question({
      question,
      questionImage,
      options,
      correctAnswer,
      teacherId,
      class: "custom",
      subject: "custom",
      topic: "custom",
      isCustom: true,
    });

    await newQuestion.save();

    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    quiz.questions.push(newQuestion._id);
    await quiz.save();

    res.status(201).json({ message: "Custom question added", question: newQuestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Check if quiz ID exists
router.get("/check/:quizId", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ quizId: req.params.quizId });
    res.status(200).json({ exists: !!quiz });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get quiz by quizId (custom ID, not MongoDB _id)
router.get("/by-id/:quizId", async (req, res) => {
  try {
    // Don't populate questions since they're custom string IDs, not ObjectIds
    const quiz = await Quiz.findOne({ quizId: req.params.quizId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.status(200).json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enhanced quiz creation with full configuration
router.post("/create", async (req, res) => {
  try {
    const { teacherId, quizId } = req.body;

    // Validate teacherId
    const teacher = await findTeacherByIdentifier(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Check if quizId already exists
    const existingQuiz = await Quiz.findOne({ quizId });
    if (existingQuiz) {
      return res.status(400).json({ error: "Quiz ID already exists" });
    }

    // Create and save the quiz
    const quiz = new Quiz(req.body);
    await quiz.save();

    // Add quiz ID to teacher's quizzesCreated array
    teacher.quizzesCreated.push(quiz._id);
    await teacher.save();

    res.status(201).json(quiz);
  } catch (err) {
    console.error("Error creating quiz:", err);
    res.status(400).json({ error: err.message });
  }
});

// Get detailed analytics for a quiz
router.get("/analytics/:quizId", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ quizId: req.params.quizId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Get all submitted reports for this quiz (ignore in-progress drafts)
    const reports = await StudentReport.find({
      quizId: quiz.quizId,
      submissionStatus: { $ne: "draft" },
    });
    
    console.log(`Found ${reports.length} reports for quiz ${quiz.quizId}`);
    
    // Build a map of questionId to questionType from quiz.questions array
    const questionTypeMap = {};
    let questionIndex = 0;
    
    // Map questions to their types based on quiz configuration
    const { mcq, audio, video, puzzle } = quiz.questionTypes;
    quiz.questions.forEach((qId, idx) => {
      if (idx < mcq) {
        questionTypeMap[qId] = 'mcq';
      } else if (idx < mcq + audio) {
        questionTypeMap[qId] = 'audio';
      } else if (idx < mcq + audio + video) {
        questionTypeMap[qId] = 'video';
      } else {
        questionTypeMap[qId] = 'puzzle';
      }
    });
    
    console.log('Question type map:', questionTypeMap);
    
    // Calculate statistics from StudentReport model (which has correct, incorrect, unattempted)
    const studentReports = reports.map(report => {
      const totalQuestions = report.correct + report.incorrect + report.unattempted;
      const percentage = totalQuestions > 0 ? ((report.correct / totalQuestions) * 100) : 0;
      
      // Calculate section-wise scores
      const sectionWise = {
        mcq: { correct: 0, incorrect: 0, unattempted: 0, total: 0, percentage: 0 },
        audio: { correct: 0, incorrect: 0, unattempted: 0, total: 0, percentage: 0 },
        video: { correct: 0, incorrect: 0, unattempted: 0, total: 0, percentage: 0 },
        puzzle: { correct: 0, incorrect: 0, unattempted: 0, total: 0, percentage: 0 }
      };
      
      // Process answers to get section-wise data
      if (report.answers && Array.isArray(report.answers)) {
        report.answers.forEach(answer => {
          // Use questionType from answer if available, otherwise from questionTypeMap
          const type = answer.questionType || questionTypeMap[answer.questionId];
          
          if (type && sectionWise[type]) {
            sectionWise[type].total++;
            if (!answer.selectedAnswer || answer.selectedAnswer === null || answer.selectedAnswer === '') {
              sectionWise[type].unattempted++;
            } else if (answer.isCorrect) {
              sectionWise[type].correct++;
            } else {
              sectionWise[type].incorrect++;
            }
          } else {
            console.log(`Unknown question type for question ${answer.questionId}: ${type}`);
          }
        });
        
        // Calculate percentages for each section
        Object.keys(sectionWise).forEach(key => {
          const section = sectionWise[key];
          section.percentage = section.total > 0 
            ? ((section.correct / section.total) * 100).toFixed(2)
            : 0;
        });
      }
      
      console.log(`Student ${report.studentId} section-wise:`, sectionWise);
      
      // Get time taken - if not in report, it's undefined (will be handled in frontend)
      let timeTaken = report.timeTaken;
      if (timeTaken === undefined || timeTaken === null || timeTaken === 0) {
        timeTaken = undefined; // Set to undefined so frontend shows N/A
      }
      
      return {
        studentId: report.studentId,
        correct: report.correct,
        incorrect: report.incorrect,
        unattempted: report.unattempted,
        totalQuestions: totalQuestions,
        percentage: percentage.toFixed(2),
        timeTaken: timeTaken, // Include time taken (undefined if not available)
        sectionWise: sectionWise,
        submittedAt: report.createdAt || new Date()
      };
    }).sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
    
    // Calculate section-wise rankings
    const sectionRankings = {
      mcq: [...studentReports].sort((a, b) => parseFloat(b.sectionWise.mcq.percentage) - parseFloat(a.sectionWise.mcq.percentage)),
      audio: [...studentReports].sort((a, b) => parseFloat(b.sectionWise.audio.percentage) - parseFloat(a.sectionWise.audio.percentage)),
      video: [...studentReports].sort((a, b) => parseFloat(b.sectionWise.video.percentage) - parseFloat(a.sectionWise.video.percentage)),
      puzzle: [...studentReports].sort((a, b) => parseFloat(b.sectionWise.puzzle.percentage) - parseFloat(a.sectionWise.puzzle.percentage))
    };
    
    // Calculate question-wise analytics
    const questionAnalytics = {};
    reports.forEach(report => {
      if (report.answers && Array.isArray(report.answers)) {
        report.answers.forEach(answer => {
          const qId = answer.questionId;
          if (!questionAnalytics[qId]) {
            // Use questionType from answer if available, otherwise from questionTypeMap
            const type = answer.questionType || questionTypeMap[qId];
            questionAnalytics[qId] = {
              questionId: qId,
              questionType: type,
              correct: 0,
              incorrect: 0,
              skipped: 0,
              totalAttempts: 0
            };
          }
          
          questionAnalytics[qId].totalAttempts++;
          
          if (!answer.selectedAnswer || answer.selectedAnswer === null || answer.selectedAnswer === '') {
            questionAnalytics[qId].skipped++;
          } else if (answer.isCorrect) {
            questionAnalytics[qId].correct++;
          } else {
            questionAnalytics[qId].incorrect++;
          }
        });
      }
    });
    
    // Fetch actual question data
    const Question = require("../models/Question");
    const AudioQuestion = require("../models/AudioQuestion");
    const VideoQuestion = require("../models/VideoQuestion");
    
    // Define available puzzles (same as in puzzles.js)
    const AVAILABLE_PUZZLES = [
      {
        _id: "puzzle_memory_match",
        puzzleType: "memory_match",
        title: "मेमोरी मैच",
        description: "कार्ड्स की स्थिति याद करें और जोड़ियाँ ढूँढें। याददाश्त और ध्यान का परीक्षण।"
      },
      {
        _id: "puzzle_match_pieces",
        puzzleType: "match_pieces",
        title: "मैच पीसेज़",
        description: "चित्र के टुकड़ों को जोड़कर मूल चित्र बनाएं। दृश्य पहचान और स्थानिक तर्क का परीक्षण।"
      }
    ];
    
    // Convert to array and calculate percentages, then fetch question details
    const questionAnalyticsArray = await Promise.all(
      Object.values(questionAnalytics).map(async (q) => {
        let questionData = null;
        
        try {
          // Fetch question based on type
          if (q.questionType === 'mcq') {
            questionData = await Question.findById(q.questionId).lean();
            if (questionData) {
              questionData.question = questionData.question || 'MCQ Question';
            }
          } else if (q.questionType === 'audio') {
            questionData = await AudioQuestion.findById(q.questionId).lean();
            if (questionData) {
              questionData.question = questionData.question || 'Audio Question';
            }
          } else if (q.questionType === 'video') {
            // Video questions can be either full documents or individual questions from parent
            // Check if ID contains underscore (individual question: parentId_qIndex)
            if (q.questionId.includes('_q')) {
              // Individual question from video set
              const [parentId, qPart] = q.questionId.split('_q');
              const questionIndex = parseInt(qPart);
              
              const parentVideo = await VideoQuestion.findById(parentId).lean();
              if (parentVideo && parentVideo.questions && parentVideo.questions[questionIndex]) {
                const specificQ = parentVideo.questions[questionIndex];
                questionData = {
                  question: specificQ.question,
                  options: specificQ.options,
                  correctAnswer: specificQ.correctAnswer,
                  videoUrl: parentVideo.videoUrl,
                  videoTitle: parentVideo.videoTitle,
                  hint: specificQ.hint,
                  solution: specificQ.solution,
                  type: 'video'
                };
              }
            } else {
              // Try as full video question document
              questionData = await VideoQuestion.findById(q.questionId).lean();
              if (questionData) {
                // If it has multiple questions, use the first one
                if (questionData.questions && questionData.questions.length > 0) {
                  const firstQ = questionData.questions[0];
                  questionData.question = firstQ.question || questionData.videoTitle || 'Video Question';
                  questionData.options = firstQ.options;
                  questionData.correctAnswer = firstQ.correctAnswer;
                  questionData.hint = firstQ.hint;
                  questionData.solution = firstQ.solution;
                } else {
                  questionData.question = questionData.videoTitle || 'Video Question';
                }
              }
            }
            
            // Fallback if not found
            if (!questionData) {
              questionData = { 
                question: 'Video Question',
                videoTitle: 'Video Question',
                type: 'video'
              };
            }
          } else if (q.questionType === 'puzzle') {
            // Find puzzle from predefined list
            const puzzle = AVAILABLE_PUZZLES.find(p => p._id === q.questionId);
            if (puzzle) {
              questionData = { 
                question: puzzle.title,
                description: puzzle.description,
                puzzleType: puzzle.puzzleType,
                type: 'puzzle'
              };
            } else {
              questionData = { 
                question: 'Interactive Puzzle Game',
                type: 'puzzle'
              };
            }
          }
        } catch (fetchError) {
          console.log(`Could not fetch question ${q.questionId}:`, fetchError.message);
          // Create minimal placeholder based on type
          questionData = {
            question: `${q.questionType.toUpperCase()} Question`,
            type: q.questionType
          };
        }
        
        return {
          ...q,
          correctPercentage: q.totalAttempts > 0 ? ((q.correct / q.totalAttempts) * 100).toFixed(2) : 0,
          incorrectPercentage: q.totalAttempts > 0 ? ((q.incorrect / q.totalAttempts) * 100).toFixed(2) : 0,
          skippedPercentage: q.totalAttempts > 0 ? ((q.skipped / q.totalAttempts) * 100).toFixed(2) : 0,
          questionData: questionData ? {
            question: questionData.question || questionData.videoTitle || questionData.title || 'Question',
            options: questionData.options || [],
            correctAnswer: questionData.correctAnswer || null,
            questionImage: questionData.questionImage || null,
            audio: questionData.audio || null,
            videoUrl: questionData.videoUrl || null,
            puzzleType: questionData.puzzleType || null,
            description: questionData.description || null,
            hint: questionData.hint || null,
            solution: questionData.solution || null
          } : null
        };
      })
    );
    
    const analytics = {
      quizInfo: {
        quizId: quiz.quizId,
        totalQuestions: quiz.totalQuestions,
        timeLimit: quiz.timeLimit,
        questionTypes: quiz.questionTypes,
        startTime: quiz.startTime,
        endTime: quiz.endTime,
        questions: quiz.questions // Include question IDs
      },
      totalAttempts: reports.length,
      studentReports: studentReports,
      sectionRankings: sectionRankings,
      questionAnalytics: questionAnalyticsArray, // Add question-wise analytics
      averageScore: reports.length > 0 
        ? (studentReports.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / reports.length).toFixed(2)
        : 0,
      highestScore: reports.length > 0 
        ? Math.max(...studentReports.map(r => parseFloat(r.percentage)))
        : 0,
      lowestScore: reports.length > 0 
        ? Math.min(...studentReports.map(r => parseFloat(r.percentage)))
        : 0,
      sectionAverages: {
        mcq: reports.length > 0 ? (studentReports.reduce((sum, r) => sum + parseFloat(r.sectionWise.mcq.percentage || 0), 0) / reports.length).toFixed(2) : 0,
        audio: reports.length > 0 ? (studentReports.reduce((sum, r) => sum + parseFloat(r.sectionWise.audio.percentage || 0), 0) / reports.length).toFixed(2) : 0,
        video: reports.length > 0 ? (studentReports.reduce((sum, r) => sum + parseFloat(r.sectionWise.video.percentage || 0), 0) / reports.length).toFixed(2) : 0,
        puzzle: reports.length > 0 ? (studentReports.reduce((sum, r) => sum + parseFloat(r.sectionWise.puzzle.percentage || 0), 0) / reports.length).toFixed(2) : 0
      }
    };

    res.status(200).json(analytics);
  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).json({ error: err.message });
  }
});

// Advanced quiz draft APIs
router.get("/advanced-draft/:quizId/:studentId", async (req, res) => {
  try {
    const quizId = String(req.params.quizId || "").trim();
    const studentId = String(req.params.studentId || "").trim();

    if (!quizId || !studentId) {
      return res.status(400).json({ error: "quizId and studentId are required" });
    }

    const submittedReport = await StudentReport.findOne(submittedReportFilter(quizId, studentId)).lean();
    if (submittedReport) {
      return res.status(409).json({
        message: "Quiz already submitted. Draft is no longer available.",
        submitted: true,
      });
    }

    const draftReport = await StudentReport.findOne(draftReportFilter(quizId, studentId)).lean();
    if (!draftReport) {
      return res.status(404).json({ message: "No saved draft found" });
    }

    return res.status(200).json({ draft: serializeDraftFromStudentReport(draftReport) });
  } catch (err) {
    console.error("Error fetching advanced quiz draft:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.put("/advanced-draft", async (req, res) => {
  try {
    const quizId = String(req.body.quizId || "").trim();
    const studentId = String(req.body.studentId || "").trim();

    if (!quizId || !studentId) {
      return res.status(400).json({ error: "quizId and studentId are required" });
    }

    const submittedReport = await StudentReport.findOne(submittedReportFilter(quizId, studentId)).lean();
    if (submittedReport) {
      return res.status(409).json({
        message: "Quiz already submitted. Draft updates are disabled.",
        submitted: true,
      });
    }

    const updatePayload = {
      quizId,
      studentId,
      correct: Number(req.body.correct || 0),
      incorrect: Number(req.body.incorrect || 0),
      unattempted: Number(req.body.unattempted || 0),
      timeTaken: Number(req.body.timeTaken || 0),
      answers: Array.isArray(req.body.answers) ? req.body.answers : [],
      submissionStatus: "draft",
      draftState: {
        quizInfo: req.body.quizInfo || {},
        currentIndex: Number(req.body.currentIndex || 0),
        timeRemaining: Number(req.body.timeRemaining || 0),
        initialTimeLimit: Number(req.body.initialTimeLimit || 0),
        quizStarted: Boolean(req.body.quizStarted),
        quizEnded: Boolean(req.body.quizEnded),
        startedAt: req.body.startedAt ? new Date(req.body.startedAt) : new Date(),
        puzzleResults: req.body.puzzleResults || {},
        videoAnalytics: req.body.videoAnalytics || {},
        lastSyncedAt: new Date(),
      },
    };

    const savedDraft = await StudentReport.findOneAndUpdate(
      draftReportFilter(quizId, studentId),
      { $set: updatePayload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      message: "Draft saved successfully",
      draft: serializeDraftFromStudentReport(savedDraft),
    });
  } catch (err) {
    console.error("Error saving advanced quiz draft:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/advanced-draft/:quizId/:studentId", async (req, res) => {
  try {
    const quizId = String(req.params.quizId || "").trim();
    const studentId = String(req.params.studentId || "").trim();

    if (!quizId || !studentId) {
      return res.status(400).json({ error: "quizId and studentId are required" });
    }

    await StudentReport.findOneAndUpdate(
      draftReportFilter(quizId, studentId),
      { isDeleted: true },
      { includeDeleted: true }
    );
    return res.status(200).json({ message: "Draft deleted successfully" });
  } catch (err) {
    console.error("Error deleting advanced quiz draft:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Submit advanced quiz attempt
router.post("/submit-advanced", async (req, res) => {
  try {
    const { quizId, studentId, answers, score, timeTaken, completedAt, timeUp } = req.body;

    console.log('=== BACKEND SUBMIT DEBUG ===');
    console.log('Received studentId:', studentId);
    console.log('studentId type:', typeof studentId);
    console.log('studentId length:', studentId?.length);
    console.log('===========================');

    // Validate required fields
    if (!quizId) {
      return res.status(400).json({ error: "Quiz ID is required" });
    }

    if (!studentId || studentId.trim() === '') {
      return res.status(400).json({ error: "Student ID is required and cannot be empty" });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Answers array is required" });
    }

    if (!score || typeof score.correct === 'undefined' || typeof score.incorrect === 'undefined') {
      return res.status(400).json({ error: "Score object with correct and incorrect counts is required" });
    }

    // Find the quiz
    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const normalizedStudentId = studentId.trim();

    // Check if student has already submitted this quiz
    const existingSubmission = await StudentReport.findOne(
      submittedReportFilter(quizId, normalizedStudentId)
    );
    
    if (existingSubmission) {
      return res.status(400).json({ 
        error: "You have already submitted this quiz", 
        message: "Duplicate submission not allowed",
        existingReport: existingSubmission._id
      });
    }

    // Create a student report
    const Student = require("../models/Student");
    
    const student = await Student.findOne({ studentId: normalizedStudentId });
    
    if (!student) {
      console.warn(`Student with ID ${normalizedStudentId} not found in database`);
    }

    const normalizeHintText = (hint) => {
      if (typeof hint === "string") {
        const trimmedHint = hint.trim();
        return trimmedHint.length > 0 ? trimmedHint : null;
      }

      if (hint && typeof hint === "object" && typeof hint.text === "string") {
        const trimmedHintText = hint.text.trim();
        return trimmedHintText.length > 0 ? trimmedHintText : null;
      }

      return null;
    };

    const normalizeSolutionText = (solution) => {
      if (typeof solution === "string") {
        const trimmedSolution = solution.trim();
        return trimmedSolution.length > 0 ? trimmedSolution : null;
      }

      if (!solution || typeof solution !== "object") {
        return null;
      }

      if (typeof solution.text === "string") {
        const trimmedSolutionText = solution.text.trim();
        if (trimmedSolutionText.length > 0) {
          return trimmedSolutionText;
        }
      }

      if (Array.isArray(solution.steps)) {
        const stepsText = solution.steps
          .filter((step) => typeof step === "string" && step.trim().length > 0)
          .join("\n");

        if (stepsText.length > 0) {
          return stepsText;
        }
      }

      return null;
    };
    
    const normalizedAnswers = answers.map((ans) => {
      const answerObj = {
        questionId: ans.questionId,
        questionType: ans.questionType,
        selectedAnswer: ans.selectedAnswer,
        isCorrect: ans.isCorrect,
        correctAnswer: ans.correctAnswer,
        timeSpent: ans.timeSpent || 0
      };
      
      // Add video question specific data if present
      if (ans.questionType === 'video') {
        answerObj.questionText = ans.questionText;
        answerObj.options = ans.options;
        answerObj.hint = normalizeHintText(ans.hint);
        answerObj.solution = normalizeSolutionText(ans.solution);
        answerObj.parentVideoId = ans.parentVideoId;
        answerObj.questionIndex = ans.questionIndex;
        
        // Add video analytics if present
        if (ans.videoAnalytics) {
          answerObj.videoAnalytics = ans.videoAnalytics;
        }
      }
      
      return answerObj;
    });

    const existingDraftReport = await StudentReport.findOne(
      draftReportFilter(quizId, normalizedStudentId)
    );

    let report = null;
    if (existingDraftReport) {
      existingDraftReport.correct = score.correct;
      existingDraftReport.incorrect = score.incorrect;
      existingDraftReport.unattempted = score.unattempted;
      existingDraftReport.timeTaken = timeTaken || 0;
      existingDraftReport.answers = normalizedAnswers;
      existingDraftReport.submissionStatus = "submitted";
      existingDraftReport.draftState = undefined;
      report = await existingDraftReport.save();
    } else {
      report = await new StudentReport({
        quizId,
        studentId: normalizedStudentId,
        submissionStatus: "submitted",
        correct: score.correct,
        incorrect: score.incorrect,
        unattempted: score.unattempted,
        timeTaken: timeTaken || 0,
        answers: normalizedAnswers,
      }).save();
    }

    // Also save puzzle results to PuzzleResult collection for puzzle history tracking
    const PuzzleResult = require("../models/PuzzleResult");
    const puzzleAnswers = answers.filter(ans => ans.questionType === 'puzzle' && ans.puzzleData);
    for (const pAns of puzzleAnswers) {
      try {
        const pd = pAns.puzzleData;
        const puzzleDoc = {
          studentId: normalizedStudentId,
          puzzleType: pd.puzzleType,
          score: pd.score || 0,
          timeTaken: pd.timeTaken || 0,
          endReason: pd.endReason || 'COMPLETED',
        };

        // Memory match specific fields
        if (pd.puzzleType === 'memory_match') {
          puzzleDoc.mode = pd.mode || 'individual';
          puzzleDoc.totalPairs = pd.totalPairs;
          puzzleDoc.correctPairs = pd.correctPairs;
          puzzleDoc.totalClicks = pd.totalClicks;
          puzzleDoc.incorrectClicks = pd.incorrectClicks;
          puzzleDoc.nearbyClicks = pd.nearbyClicks;

          // Enhanced cognitive metrics
          if (pd.clickTimestamps && pd.clickTimestamps.length > 1) {
            const intervals = pd.clickTimestamps.slice(1).map((time, i) => time - pd.clickTimestamps[i]);
            const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length / 1000;
            
            puzzleDoc.cognitiveMetrics = {
              workingMemory: Number(((pd.correctPairs || 0) / (pd.totalPairs || 1)).toFixed(3)),
              attentionControl: Number((1 - Math.max(0, (pd.incorrectClicks || 0) - 0.3 * (pd.nearbyClicks || 0)) / (pd.totalPairs || 1)).toFixed(3)),
              processingSpeed: Number((1 - (pd.timeTaken || 0) / 180).toFixed(3)),
              strategicEfficiency: Number((1 - Math.max(0, (pd.totalClicks || 0) - 2 * (pd.correctPairs || 0)) / (4 * (pd.totalPairs || 1))).toFixed(3)),
              terminationPenalty: pd.endReason === 'EXITED' ? 0.25 * (1 - (pd.correctPairs || 0) / (pd.totalPairs || 1)) : (pd.endReason === 'TIME_UP' ? 0.08 : 0),
              averageClickInterval: avgInterval
            };
          }

          // Enhanced gameplay metrics
          puzzleDoc.gameplayMetrics = {
            totalPairs: pd.totalPairs,
            correctPairs: pd.correctPairs,
            totalClicks: pd.totalClicks,
            incorrectClicks: pd.incorrectClicks,
            nearbyClicks: pd.nearbyClicks,
            timeTaken: pd.timeTaken,
            mode: pd.mode,
            clickEfficiency: pd.totalClicks > 0 ? Number((pd.correctPairs * 2 / pd.totalClicks).toFixed(3)) : 0
          };
        }

        // Match pieces specific fields (unchanged for now)
        if (pd.puzzleType === 'match_pieces') {
          puzzleDoc.totalImages = pd.totalImages;
          puzzleDoc.imagesCompleted = pd.imagesCompleted;
          puzzleDoc.totalMoves = pd.totalMoves;
          if (pd.perImage) {
            puzzleDoc.perImageSummary = pd.perImage.map(img => ({
              imageIndex: img.imageIndex,
              correct: img.correctPlacements,
              total: img.totalPieces,
              moves: img.moveCount,
              completed: img.correctPlacements === img.totalPieces,
              timeMs: img.timeTakenMs,
            }));
          }
        }

        await new PuzzleResult(puzzleDoc).save();
        console.log(`Saved enhanced puzzle result for student ${normalizedStudentId}, type: ${pd.puzzleType}, score: ${pd.score}`);
      } catch (puzzleErr) {
        console.error("Error saving enhanced puzzle result from quiz:", puzzleErr);
        // Don't fail the whole submission for puzzle save errors
      }
    }

    // Update quiz attemptedBy array if not already present
    if (!quiz.attemptedBy.includes(normalizedStudentId)) {
      quiz.attemptedBy.push(normalizedStudentId);
      await quiz.save();
    }

    res.status(201).json({
      message: "Quiz submitted successfully",
      reportId: report._id,
      score: {
        correct: score.correct,
        incorrect: score.incorrect,
        unattempted: score.unattempted,
        percentage: ((score.correct / quiz.totalQuestions) * 100).toFixed(2)
      }
    });
  } catch (err) {
    console.error("Error submitting quiz:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
