const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  subject: { type: String , required:true },
  class: { type: String, required:false },
  topic: { type: String, required:true },
  question: { type: String, required : true },
  // Hindi translations. "NA" means the question is single-lingual (no Hindi
  // version). The UI shows the Hindi text when it exists and isn't "NA".
  questionHindi: { type: String, default: "NA" },
  optionsHindi: { type: [String], default: undefined },
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

questionSchema.index({ class: 1, subject: 1, topic: 1, question: 1 });

module.exports = mongoose.model("Question", questionSchema);
