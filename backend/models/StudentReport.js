const mongoose = require("mongoose");

const studentReportSchema = new mongoose.Schema({
  quizId: { type: String, required: true },
  studentId: { type: String, required: true },
  attemptMode: {
    type: String,
    enum: ["quiz", "group"],
    default: "quiz",
    index: true,
  },
  groupAttemptId: { type: String, index: true },
  groupMembers: [
    {
      studentId: String,
      name: String,
      color: String,
    },
  ],
  submissionStatus: {
    type: String,
    enum: ["draft", "submitted"],
    default: "submitted",
    index: true,
  },
  correct: { type: Number, required: true },
  incorrect: { type: Number, required: true },
  unattempted: { type: Number, required: true },
  timeTaken: { type: Number }, // Time taken in seconds
  draftState: {
    quizInfo: { type: mongoose.Schema.Types.Mixed, default: {} },
    currentIndex: { type: Number, default: 0 },
    timeRemaining: { type: Number, default: 0 },
    initialTimeLimit: { type: Number, default: 0 },
    quizStarted: { type: Boolean, default: false },
    quizEnded: { type: Boolean, default: false },
    startedAt: { type: Date },
    puzzleResults: { type: mongoose.Schema.Types.Mixed, default: {} },
    videoAnalytics: { type: mongoose.Schema.Types.Mixed, default: {} },
    lastSyncedAt: { type: Date },
  },
  answers: [
    {
      questionId: { type: String },
      questionType: { type: String },
      selectedAnswer: { type: mongoose.Schema.Types.Mixed, default: null },
      isCorrect: Boolean,
      correctAnswer: String,
      timeSpent: { type: Number, default: 0 }, // Time spent on this question in seconds
      
      // Video question specific data (for displaying in past reports)
      questionText: String,
      options: [String],
      hint: String,
      solution: String,
      parentVideoId: String,
      questionIndex: Number,
      
      // Video analytics data
      videoAnalytics: {
        videoDuration: Number,
        watchTime: Number,
        watchPercentage: Number,
        pauseCount: Number,
        seekCount: Number,
        playbackEvents: [{
          action: String,
          timestamp: Number
        }]
      }
    },
  ],
}, { timestamps: true }); // Add timestamps to track createdAt and updatedAt

module.exports = mongoose.model("StudentReport", studentReportSchema);
