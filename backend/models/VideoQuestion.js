const mongoose = require("mongoose");

const videoQuestionSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  class: { type: String, required: true },
  topic: { type: String, required: true },
  videoUrl: { type: String, required: true }, // Cloudinary video URL
  localPath: { type: String, default: null },
  cloudUrl: { type: String, default: null },
  videoTitle: { type: String, required: true },
  videoDescription: { type: String },
  videoDuration: { type: String }, // e.g., "5:30"
  questions: [
    {
      question: { type: String, required: true },
      options: { type: [String], required: true },
      correctAnswer: { type: String, required: true },
      hint: {
        text: { type: String },
        image: { type: String },
      },
      solution: {
        text: { type: String },
        steps: { type: [String] }, // Array of solution steps
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("VideoQuestion", videoQuestionSchema);
