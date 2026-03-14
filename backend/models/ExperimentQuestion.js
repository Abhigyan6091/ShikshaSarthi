const mongoose = require("mongoose");

const experimentQuestionSchema = new mongoose.Schema({
  experimentName: { type: String, required: true, index: true }, // Links to the frontend experiment name
  subject: { type: String, required: true },
  class: { type: String, required: true },
  topic: { type: String, required: true }, // Could be same as experimentName or broader
  question: { type: String, required: true },
  
  options: {
    type: [String],
    required: true
  },

  correctAnswer: {
    type: String, // The actual text answer or index? AudioQuestion uses string.
    required: true
  },

  explanation: {
    type: String,
    required: false
  },

  type: {
      type: String,
      enum: ['multiple-choice', 'true-false'],
      default: 'multiple-choice'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("ExperimentQuestion", experimentQuestionSchema);
