const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  options: [{
    optionText: {
      type: String,
      required: true
    }
  }]
});

const feedbackFormSchema = new mongoose.Schema({
  formId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  schoolId: {
    type: String,
    ref: 'School',
    required: true
  },
  questions: [questionSchema],
  createdBy: {
    type: String,
    ref: 'SchoolAdmin',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
feedbackFormSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const FeedbackForm = mongoose.model('FeedbackForm', feedbackFormSchema);

module.exports = FeedbackForm;
