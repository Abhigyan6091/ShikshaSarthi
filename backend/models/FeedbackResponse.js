const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  selectedOption: {
    type: Number,
    required: true
  }
});

const feedbackResponseSchema = new mongoose.Schema({
  responseId: {
    type: String,
    required: true,
    unique: true
  },
  formId: {
    type: String,
    ref: 'FeedbackForm',
    required: true
  },
  // A response comes from either a teacher or a student. teacherId stays for
  // backward compatibility; studentId is used for student respondents.
  teacherId: {
    type: String,
    ref: 'Teacher',
    required: false
  },
  studentId: {
    type: String,
    ref: 'Student',
    required: false
  },
  respondentRole: {
    type: String,
    enum: ['teacher', 'student'],
    default: 'teacher'
  },
  schoolId: {
    type: String,
    ref: 'School',
    required: true
  },
  answers: [answerSchema],
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const FeedbackResponse = mongoose.model('FeedbackResponse', feedbackResponseSchema);

module.exports = FeedbackResponse;
