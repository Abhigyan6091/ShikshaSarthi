const express = require('express');
const router = express.Router();
const MATQuestion = require('../models/MATQuestion');
const MATProgress = require('../models/MATProgress');

// Get animated questions
router.get('/questions', async (req, res) => {
  try {
    const { animated } = req.query;
    
    let query = { isActive: true };
    if (animated === 'true') {
      query['animation.enabled'] = true;
    }

    const questions = await MATQuestion.find(query);
    res.json(questions);
  } catch (error) {
    console.error('Error fetching MAT questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get all modules with question counts
router.get('/modules', async (req, res) => {
  try {
    const modules = await MATQuestion.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$module',
          totalQuestions: { $sum: 1 },
          easyQuestions: {
            $sum: { $cond: [{ $eq: ['$difficulty', 'Easy'] }, 1, 0] }
          },
          mediumQuestions: {
            $sum: { $cond: [{ $eq: ['$difficulty', 'Medium'] }, 1, 0] }
          },
          hardQuestions: {
            $sum: { $cond: [{ $eq: ['$difficulty', 'Hard'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(modules);
  } catch (error) {
    console.error('Error fetching MAT modules:', error);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// Get questions by module
router.get('/modules/:moduleName/questions', async (req, res) => {
  try {
    const { moduleName } = req.params;
    const { difficulty, limit } = req.query;

    let query = { module: moduleName, isActive: true };
    
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const questions = await MATQuestion.find(query)
      .select('-correctAnswer -explanation') // Hide answers initially
      .limit(limit ? parseInt(limit) : 100);

    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get single question with full details
router.get('/questions/:questionId', async (req, res) => {
  try {
    const question = await MATQuestion.findOne({ 
      questionId: req.params.questionId,
      isActive: true 
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// Submit answer and get result
router.post('/questions/:questionId/submit', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { studentId, answer, timeTaken, hintsUsed } = req.body;

    const question = await MATQuestion.findOne({ questionId, isActive: true });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const isCorrect = question.correctAnswer === parseInt(answer);

    // Update question statistics
    question.attemptCount += 1;
    if (isCorrect) {
      question.correctCount += 1;
    }
    await question.save();

    // Update student progress
    let progress = await MATProgress.findOne({
      studentId,
      module: question.module
    });

    if (!progress) {
      progress = new MATProgress({
        studentId,
        module: question.module
      });
    }

    progress.questionsAttempted.push({
      questionId,
      isCorrect,
      timeTaken: timeTaken || 0,
      attemptedAt: new Date(),
      hintsUsed: hintsUsed || 0
    });

    progress.totalQuestions += 1;
    if (isCorrect) {
      progress.correctAnswers += 1;
    } else {
      progress.incorrectAnswers += 1;
    }

    // Update average time
    const totalTime = progress.questionsAttempted.reduce(
      (sum, q) => sum + (q.timeTaken || 0), 
      0
    );
    progress.averageTimeTaken = totalTime / progress.questionsAttempted.length;
    progress.lastAttemptedAt = new Date();

    await progress.save();

    res.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      hint: question.hint,
      statistics: {
        accuracy: progress.accuracy,
        totalAttempted: progress.totalQuestions,
        correctAnswers: progress.correctAnswers
      }
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// Get student progress for a module
router.get('/progress/:studentId/:module', async (req, res) => {
  try {
    const { studentId, module } = req.params;

    const progress = await MATProgress.findOne({ studentId, module });

    if (!progress) {
      return res.json({
        studentId,
        module,
        totalQuestions: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        accuracy: 0,
        averageTimeTaken: 0,
        questionsAttempted: []
      });
    }

    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Get overall student progress across all modules
router.get('/progress/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const allProgress = await MATProgress.find({ studentId });

    const summary = {
      studentId,
      modules: allProgress.map(p => ({
        module: p.module,
        totalQuestions: p.totalQuestions,
        correctAnswers: p.correctAnswers,
        accuracy: p.accuracy,
        completionPercentage: p.completionPercentage,
        lastAttemptedAt: p.lastAttemptedAt
      })),
      overallStats: {
        totalQuestionsAttempted: allProgress.reduce((sum, p) => sum + p.totalQuestions, 0),
        totalCorrect: allProgress.reduce((sum, p) => sum + p.correctAnswers, 0),
        modulesStarted: allProgress.length
      }
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching overall progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Add new MAT question (admin only)
router.post('/questions', async (req, res) => {
  try {
    const questionData = req.body;
    
    const question = new MATQuestion(questionData);
    await question.save();

    res.status(201).json({ 
      message: 'Question created successfully',
      question 
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Bulk upload questions
router.post('/questions/bulk', async (req, res) => {
  try {
    const { questions } = req.body;

    const result = await MATQuestion.insertMany(questions, { ordered: false });

    res.status(201).json({ 
      message: 'Questions uploaded successfully',
      count: result.length 
    });
  } catch (error) {
    console.error('Error bulk uploading questions:', error);
    res.status(500).json({ error: 'Failed to upload questions' });
  }
});

module.exports = router;
