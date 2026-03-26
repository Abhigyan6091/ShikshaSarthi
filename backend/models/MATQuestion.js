const mongoose = require('mongoose');

const MATQuestionSchema = new mongoose.Schema({
  // Question identification
  questionId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Module/Topic categorization (Hindi)
  module: {
    type: String,
    required: true,
    enum: [
      'श्रृंखला पूर्णता',
      'कूटभाषा',
      'रक्त संबंध',
      'दिशा ज्ञान',
      'क्रम और व्यवस्था',
      'गणितीय संक्रियाएँ',
      'वेन आरेख',
      'पहेलियाँ और बैठने की व्यवस्था',
      'संख्या और अक्षर पैटर्न',
      'सादृश्य',
      'विषम ज्ञात कीजिए',
      'कैलेंडर और समय',
      'आंकड़ा निर्वचन',
      'तार्किक विचार'
    ]
  },
  
  subModule: {
    type: String,
    default: ''
  },
  
  // Question content
  question: {
    type: String,
    required: true
  },
  
  // Multiple choice options
  options: [{
    type: String,
    required: true
  }],
  
  // Correct answer (index of options array, 0-based)
  correctAnswer: {
    type: Number,
    required: true,
    min: 0
  },
  
  // For interactive questions - store HTML/CSS/JS
  interactiveContent: {
    html: {
      type: String,
      default: ''
    },
    css: {
      type: String,
      default: ''
    },
    javascript: {
      type: String,
      default: ''
    },
    isInteractive: {
      type: Boolean,
      default: false
    }
  },
  
  // Image support
  images: [{
    url: {
      type: String
    },
    description: {
      type: String
    },
    position: {
      type: String,
      enum: ['question', 'option', 'explanation'],
      default: 'question'
    }
  }],

  // Animation support (array of frames for step-by-step visualization)
  animation: {
    enabled: {
      type: Boolean,
      default: false
    },
    frames: [{
      html: String,
      css: String,
      javascript: String,
      description: String,
      duration: Number
    }],
    autoPlaySpeed: {
      type: Number,
      default: 2000
    }
  },
  
  // Explanation and hints
  explanation: {
    type: String,
    default: ''
  },
  
  hint: {
    type: String,
    default: ''
  },
  
  // Difficulty level
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  
  // Points and time
  points: {
    type: Number,
    default: 1
  },
  
  timeLimit: {
    type: Number, // in seconds
    default: 60
  },
  
  // Tags for better organization
  tags: [{
    type: String
  }],
  
  // Year and paper reference
  yearPaper: {
    year: String,
    paper: String,
    questionNumber: Number
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Statistics
  attemptCount: {
    type: Number,
    default: 0
  },
  
  correctCount: {
    type: Number,
    default: 0
  },
  
  // Metadata
  createdBy: {
    type: String,
    default: 'admin'
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

// Index for faster queries
MATQuestionSchema.index({ module: 1, difficulty: 1 });
MATQuestionSchema.index({ 'yearPaper.year': 1 });

// Update the updatedAt timestamp before saving
MATQuestionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate success rate
MATQuestionSchema.virtual('successRate').get(function() {
  if (this.attemptCount === 0) return 0;
  return ((this.correctCount / this.attemptCount) * 100).toFixed(2);
});

module.exports = mongoose.model('MATQuestion', MATQuestionSchema);
