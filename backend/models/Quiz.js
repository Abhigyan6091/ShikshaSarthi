const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  quizId: { type: String, unique: true, required: true },
  teacherId: { type: String, ref: "Teacher", required: true },
  questions: [{ type: String, ref: "Question" }],
  attemptedBy: [{ type: String, ref: "Student" }],
  correct: Number,
  incorrect: Number,
  unattempted: Number,
  
  // New fields for enhanced quiz management
  timeLimit: { type: Number, required: true }, // in minutes
  totalQuestions: { type: Number, required: true },
  questionTypes: {
    mcq: { type: Number, default: 0 },
    custom: { type: Number, default: 0 },
    audio: { type: Number, default: 0 },
    video: { type: Number, default: 0 },
    puzzle: { type: Number, default: 0 }
  },
  // Metadata for video questions (to track which specific question from a video set)
  videoQuestionMetadata: [{
    slotIndex: Number,
    parentVideoId: String,
    questionIndex: Number,
    questionText: String
  }],
  audience: {
    type: {
      type: String,
      enum: ["global", "classes"],
      default: "global",
    },
    classIds: [{ type: String, ref: "Class" }],
  },
  startTime: { type: Date }, // Contest start time
  endTime: { type: Date }, // Contest end time
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Quiz", quizSchema);
