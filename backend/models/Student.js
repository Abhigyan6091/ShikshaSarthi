const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  username: { type: String }, // Make optional, will default to studentId
  name: { type: String, required: true },
  phone: String,
  schoolId: { type: String, ref: "School", required: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  must_change_password: { type: Boolean, default: false },
  class: { type: String, required: true },
  profilePhoto: { type: String },
  classes: [{ type: String, ref: "Class" }], // Classes enrolled in
  quizAttempted: [
    {
      quizId: { type: String, ref: "Quiz" },
      answers: [
        {
          questionId: { type: String, ref: "Question" },
          selectedAnswer: String,
          isCorrect: Boolean // Optional, helpful for scoring
        }
      ],
      score: {
        correct: Number,
        incorrect: Number,
        unattempted: Number
      },
      attemptedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to set username to studentId if not provided
studentSchema.pre('save', async function (next) {
  if (!this.username) {
    this.username = this.studentId;
  }

  // Hash password if it's modified or new
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }

  next();
});

// Method to compare password for login
studentSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model("Student", studentSchema);
