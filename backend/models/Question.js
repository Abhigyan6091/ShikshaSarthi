const { truncate } = require("fs/promises");
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  subject: { type: String , required:true },
  class: { type: String, required:true },
  topic: { type: String, required:true },
  question: { type: String, required : true },
  questionImage: {
    type: String,
    required: false,
  },
  // Offline-first media tracking
  localPath: {
    type: String,
    default: null,
  },
  cloudUrl: {
    type: String,
    default: null,
  },
  options: {
    type: [String],
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  hint: {
    text: { type: String, required: false },
    image: { type: String },
    video: { type: String },
  }
});

module.exports = mongoose.model("Question", questionSchema);
