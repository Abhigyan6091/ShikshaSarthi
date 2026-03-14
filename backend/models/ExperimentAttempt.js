const mongoose = require('mongoose');

const experimentAttemptSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    index: true
  },
  studentName: {
    type: String,
    required: true
  },
  experimentName: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  wrongAnswers: {
    type: Number,
    required: true
  },
  
  timeTaken: {
    type: Number, // in seconds
    required: true
  },

  questionAnalytics: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExperimentQuestion' },
    questionText: String,
    selectedAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    timeTaken: Number // Time for specific question if tracked
  }],

  attemptedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ExperimentAttempt", experimentAttemptSchema);
