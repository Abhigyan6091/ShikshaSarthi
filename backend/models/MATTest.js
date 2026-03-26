const mongoose = require('mongoose');

// Individual Question Analytics Schema
const questionAnalyticsSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  questionIndex: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number, // seconds
    default: 0
  },
  attempts: {
    type: Number, // how many times visited this question
    default: 0
  },
  hintUsed: {
    type: Boolean,
    default: false
  },
  answerChangeCount: {
    type: Number, // before final submission
    default: 0
  },
  firstAttemptTime: {
    type: Number, // timestamp
    default: 0
  },
  finalAttemptTime: {
    type: Number, // timestamp
    default: 0
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  selectedAnswer: {
    type: Number, // index of selected option
    required: true
  },
  correctAnswer: {
    type: Number
  }
});

// Learning Behavior Metrics Schema
const learningBehaviorSchema = new mongoose.Schema({
  focusScore: {
    type: Number, // 0-100, based on consistent time per question
    default: 0
  },
  consistencyScore: {
    type: Number, // 0-100, based on time per question variation
    default: 0
  },
  thoughtfulnessScore: {
    type: Number, // 0-100, based on attempts and time taken
    default: 0
  },
  randomClickingIndicator: {
    type: Number, // 0-100, higher means more random clicking
    default: 0
  },
  hintsUtilization: {
    type: Number, // 0-100, how well hints were used
    default: 0
  },
  overallLearningScore: {
    type: Number, // 0-100, overall learning behavior score
    default: 0
  }
});

// Main MAT Test Attempt Schema
const MATTestSchema = new mongoose.Schema({
  // Test identification
  testId: {
    type: String,
    required: true,
    unique: true
  },
  
  studentId: {
    type: String,
    required: true
  },
  
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
  
  // Test configuration
  totalQuestions: {
    type: Number,
    required: true
  },
  
  timeLimit: {
    type: Number, // total time limit in seconds
    default: 1800 // 30 minutes default
  },
  
  // Test completion info
  startTime: {
    type: Date,
    required: true
  },
  
  endTime: {
    type: Date
  },
  
  totalTimeTaken: {
    type: Number, // actual time taken in seconds
    default: 0
  },
  
  completed: {
    type: Boolean,
    default: false
  },
  
  // Score and results
  score: {
    type: Number,
    default: 0
  },
  
  correctAnswers: {
    type: Number,
    default: 0
  },
  
  incorrectAnswers: {
    type: Number,
    default: 0
  },
  
  unattempted: {
    type: Number,
    default: 0
  },
  
  percentage: {
    type: Number,
    default: 0
  },
  
  // Detailed question-wise analytics
  questionAnalytics: [questionAnalyticsSchema],
  
  // Learning behavior metrics
  learningBehavior: {
    type: learningBehaviorSchema,
    default: () => ({
      focusScore: 0,
      consistencyScore: 0,
      thoughtfulnessScore: 0,
      randomClickingIndicator: 0,
      hintsUtilization: 0,
      overallLearningScore: 0
    })
  },
  
  // Performance breakdown by difficulty
  difficultyBreakdown: {
    easy: {
      attempted: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 }
    },
    medium: {
      attempted: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 }
    },
    hard: {
      attempted: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 }
    }
  },
  
  // Speed analytics
  speedAnalytics: {
    averageTimePerQuestion: { type: Number, default: 0 },
    fastestQuestion: { type: Number, default: 0 }, // time in seconds
    slowestQuestion: { type: Number, default: 0 }, // time in seconds
    questionsAnsweredUnderTime: { type: Number, default: 0 }, // answered before individual question time limit
    questionsAnsweredOverTime: { type: Number, default: 0 }
  },
  
  // Additional insights
  strengthAreas: [{
    type: String
  }],
  
  weaknessAreas: [{
    type: String
  }],
  
  recommendations: [{
    type: String
  }]
}, {
  timestamps: true
});

// Indexes for faster queries
MATTestSchema.index({ studentId: 1, module: 1 });
MATTestSchema.index({ studentId: 1, createdAt: -1 });

// Calculate percentage before saving
MATTestSchema.pre('save', function(next) {
  if (this.totalQuestions > 0) {
    this.percentage = Math.round((this.correctAnswers / this.totalQuestions) * 100);
  }
  next();
});

// Method to calculate learning behavior metrics (Enhanced - similar to video analytics)
MATTestSchema.methods.calculateLearningBehavior = function() {
  const analytics = this.questionAnalytics;
  
  // Initialize learningBehavior if it doesn't exist
  if (!this.learningBehavior) {
    this.learningBehavior = {
      focusScore: 0,
      consistencyScore: 0,
      thoughtfulnessScore: 0,
      randomClickingIndicator: 0,
      hintsUtilization: 0,
      overallLearningScore: 0
    };
  }
  
  if (!analytics || analytics.length === 0) {
    // Set default values if no analytics
    this.learningBehavior.focusScore = 50;
    this.learningBehavior.consistencyScore = 50;
    this.learningBehavior.thoughtfulnessScore = 50;
    this.learningBehavior.randomClickingIndicator = 0;
    this.learningBehavior.hintsUtilization = 0;
    this.learningBehavior.overallLearningScore = 50;
    return;
  }
  
  const attemptedQuestions = analytics.filter(q => q.selectedAnswer !== -1);
  const totalQuestions = analytics.length;
  
  // 1. FOCUS SCORE: Measures engagement and attention
  // Based on: completion rate, time distribution, attempts
  const completionRate = (attemptedQuestions.length / totalQuestions) * 100;
  const times = attemptedQuestions.map(q => q.timeSpent).filter(t => t > 0);
  
  let focusScore = completionRate * 0.5; // 50% weight to completion
  
  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower variance = better focus (consistent time spent)
    const consistencyBonus = avgTime > 0 ? Math.max(0, 50 - (stdDev / avgTime * 50)) : 0;
    focusScore += consistencyBonus * 0.5; // 50% weight to consistency
  }
  
  this.learningBehavior.focusScore = Math.max(0, Math.min(100, Math.round(focusScore)));
  
  // 2. CONSISTENCY SCORE: Measures systematic approach
  // Based on: answer changes, attempts pattern, navigation
  const totalChanges = analytics.reduce((sum, q) => sum + (q.answerChangeCount || 0), 0);
  const avgChanges = totalChanges / totalQuestions;
  
  // Multiple revisits indicate uncertainty (attempts > 1)
  const multipleAttempts = analytics.filter(q => q.attempts > 1).length;
  const attemptsPenalty = (multipleAttempts / totalQuestions) * 30;
  
  // Answer changes penalty (frequent changes = uncertainty/guessing)
  const changesPenalty = Math.min(40, avgChanges * 15);
  
  this.learningBehavior.consistencyScore = Math.max(0, Math.round(100 - changesPenalty - attemptsPenalty));
  
  // 3. THOUGHTFULNESS SCORE: Measures if student thinks before answering
  // Based on: reasonable time spent (5-120 seconds), not too fast, not too slow
  const reasonableTime = attemptedQuestions.filter(q => q.timeSpent >= 5 && q.timeSpent <= 120).length;
  const veryQuickAnswers = attemptedQuestions.filter(q => q.timeSpent < 3).length;
  const verySlowAnswers = attemptedQuestions.filter(q => q.timeSpent > 180).length;
  
  const thoughtfulPercentage = attemptedQuestions.length > 0 
    ? (reasonableTime / attemptedQuestions.length) * 100 
    : 50;
  
  const quickPenalty = attemptedQuestions.length > 0
    ? (veryQuickAnswers / attemptedQuestions.length) * 30
    : 0;
  
  const slowPenalty = attemptedQuestions.length > 0
    ? (verySlowAnswers / attemptedQuestions.length) * 20
    : 0;
  
  this.learningBehavior.thoughtfulnessScore = Math.max(0, Math.min(100, Math.round(thoughtfulPercentage - quickPenalty - slowPenalty)));
  
  // 4. RANDOM CLICKING INDICATOR: Detects guessing/random behavior (Higher = More Random)
  // Based on: very fast answers, excessive attempts, many answer changes
  const veryQuickScore = attemptedQuestions.length > 0
    ? (veryQuickAnswers / attemptedQuestions.length) * 40
    : 0;
  
  const excessiveAttemptsScore = totalQuestions > 0
    ? (multipleAttempts / totalQuestions) * 30
    : 0;
  
  const excessiveChangesScore = totalQuestions > 0
    ? (analytics.filter(q => q.answerChangeCount > 2).length / totalQuestions) * 30
    : 0;
  
  this.learningBehavior.randomClickingIndicator = Math.min(100, Math.round(veryQuickScore + excessiveAttemptsScore + excessiveChangesScore));
  
  // 5. HINTS UTILIZATION: Strategic use of hints
  const hintsUsedCount = analytics.filter(q => q.hintUsed).length;
  const hintsUsedPercentage = (hintsUsedCount / totalQuestions) * 100;
  
  // Optimal hint usage is 20-40%
  let hintsScore = 0;
  if (hintsUsedPercentage === 0) {
    hintsScore = 50; // Neutral - either very knowledgeable or not seeking help
  } else if (hintsUsedPercentage >= 20 && hintsUsedPercentage <= 40) {
    hintsScore = 100; // Optimal range
  } else if (hintsUsedPercentage < 20) {
    hintsScore = 50 + (hintsUsedPercentage / 20) * 50; // Scale up to 100
  } else {
    hintsScore = Math.max(30, 100 - ((hintsUsedPercentage - 40) / 60) * 70); // Scale down from 100
  }
  
  this.learningBehavior.hintsUtilization = Math.round(hintsScore);
  
  // 6. OVERALL LEARNING SCORE: Weighted combination of all factors
  const accuracy = this.totalQuestions > 0 ? (this.correctAnswers / this.totalQuestions) * 100 : 0;
  
  this.learningBehavior.overallLearningScore = Math.round(
    (accuracy * 0.4) + // 40% - Most important
    (this.learningBehavior.focusScore * 0.2) + // 20%
    (this.learningBehavior.thoughtfulnessScore * 0.2) + // 20%
    ((100 - this.learningBehavior.randomClickingIndicator) * 0.1) + // 10%
    (this.learningBehavior.hintsUtilization * 0.1) // 10%
  );
};

// Method to generate comprehensive recommendations (Enhanced - similar to video analytics)
MATTestSchema.methods.generateRecommendations = function() {
  this.recommendations = [];
  
  const analytics = this.questionAnalytics || [];
  const attemptedQuestions = analytics.filter(q => q.selectedAnswer !== -1);
  
  // 1. PERFORMANCE-BASED RECOMMENDATIONS
  if (this.percentage >= 80) {
    this.recommendations.push('🏆 उत्कृष्ट प्रदर्शन! आप इस मॉड्यूल में महारत हासिल कर रहे हैं। अपना स्तर बनाए रखें।');
  } else if (this.percentage >= 60) {
    this.recommendations.push('👍 अच्छा प्रदर्शन! कमजोर क्षेत्रों पर अधिक ध्यान दें और 80% के लक्ष्य के लिए प्रयास करें।');
  } else if (this.percentage >= 40) {
    this.recommendations.push('📚 सुधार की आवश्यकता। अवधारणाओं को फिर से पढ़ें और नियमित अभ्यास करें।');
  } else {
    this.recommendations.push('⚠️ मूल अवधारणाओं पर अधिक काम की आवश्यकता। धीरे-धीरे शुरू करें और मूल बातें मजबूत करें।');
  }
  
  // 2. FOCUS & ENGAGEMENT RECOMMENDATIONS
  if (this.learningBehavior.focusScore < 50) {
    this.recommendations.push('🎯 ध्यान केंद्रित करें: विकर्षणों को कम करें और एक प्रश्न को पूरा करने के बाद अगले पर जाएं।');
  } else if (this.learningBehavior.focusScore > 80) {
    this.recommendations.push('✨ उत्कृष्ट ध्यान केंद्रण! आप परीक्षा के दौरान केंद्रित रहे।');
  }
  
  // 3. TIME MANAGEMENT RECOMMENDATIONS
  const avgTime = this.speedAnalytics.averageTimePerQuestion;
  if (avgTime < 20) {
    this.recommendations.push('⏱️ धीमा करें: आप बहुत तेज़ जा रहे हैं। प्रत्येक प्रश्न को ध्यान से पढ़ने के लिए समय लें (30-60 सेकंड)।');
  } else if (avgTime > 100) {
    this.recommendations.push('⚡ गति बढ़ाएं: अत्यधिक विचार न करें। पहली प्रतिक्रिया अक्सर सही होती है (लक्ष्य: 45-60 सेकंड/प्रश्न)।');
  } else if (avgTime >= 40 && avgTime <= 70) {
    this.recommendations.push('⏰ आदर्श गति! आप प्रत्येक प्रश्न पर उचित समय बिता रहे हैं।');
  }
  
  // 4. RANDOM CLICKING DETECTION & ADVICE
  if (this.learningBehavior.randomClickingIndicator > 60) {
    this.recommendations.push('🚫 टुक्का मत लगाओ: कई प्रश्न बहुत जल्दी उत्तरित हुए। विकल्पों को पढ़ें और सोच-समझकर चुनें।');
  } else if (this.learningBehavior.randomClickingIndicator > 40) {
    this.recommendations.push('⚠️ कुछ प्रश्नों पर जल्दबाजी: अनुमान लगाने से पहले सभी विकल्पों का मूल्यांकन करें।');
  } else if (this.learningBehavior.randomClickingIndicator < 20) {
    this.recommendations.push('🧠 विचारशील दृष्टिकोण! आप अनुमान लगाने के बजाय सोच-समझकर उत्तर दे रहे हैं।');
  }
  
  // 5. THOUGHTFULNESS RECOMMENDATIONS
  if (this.learningBehavior.thoughtfulnessScore < 50) {
    this.recommendations.push('🤔 अधिक सोचें: प्रत्येक प्रश्न पर 30-60 सेकंड बिताएं। विकल्पों की तुलना करें।');
  } else if (this.learningBehavior.thoughtfulnessScore > 80) {
    this.recommendations.push('💭 उत्कृष्ट विचारशीलता! आप उचित समय लेकर उत्तर दे रहे हैं।');
  }
  
  // 6. CONSISTENCY RECOMMENDATIONS
  if (this.learningBehavior.consistencyScore < 50) {
    const totalChanges = analytics.reduce((sum, q) => sum + (q.answerChangeCount || 0), 0);
    if (totalChanges > analytics.length * 1.5) {
      this.recommendations.push('🔄 अपने उत्तरों पर विश्वास करें: बहुत सारे उत्तर बदल रहे हैं। पहली सोच अक्सर सही होती है।');
    }
    const multipleAttempts = analytics.filter(q => q.attempts > 1).length;
    if (multipleAttempts > analytics.length * 0.5) {
      this.recommendations.push('🎯 व्यवस्थित रहें: प्रश्नों के बीच बहुत अधिक कूदना। क्रम में आगे बढ़ें।');
    }
  }
  
  // 7. HINT USAGE RECOMMENDATIONS
  const hintsUsed = analytics.filter(q => q.hintUsed).length;
  const hintPercentage = (hintsUsed / analytics.length) * 100;
  
  if (hintPercentage > 60) {
    this.recommendations.push('💡 संकेतों पर कम निर्भर रहें: पहले स्वयं प्रयास करें। संकेत केवल फंसने पर देखें।');
  } else if (hintPercentage >= 20 && hintPercentage <= 40) {
    this.recommendations.push('✅ संकेतों का अच्छा उपयोग! आप उन्हें रणनीतिक रूप से उपयोग कर रहे हैं।');
  } else if (hintPercentage < 10 && this.percentage < 60) {
    this.recommendations.push('💡 संकेतों का उपयोग करें: जब फंस जाएं तो संकेत मदद कर सकते हैं। उनका उपयोग करने में संकोच न करें।');
  }
  
  // 8. DIFFICULTY-SPECIFIC RECOMMENDATIONS
  if (this.difficultyBreakdown.easy.attempted > 0 && this.difficultyBreakdown.easy.accuracy < 70) {
    this.recommendations.push('📖 मूल बातें मजबूत करें: आसान प्रश्नों में सुधार की आवश्यकता। अवधारणाओं को फिर से पढ़ें।');
  }
  
  if (this.difficultyBreakdown.medium.attempted > 0 && this.difficultyBreakdown.medium.accuracy >= 70) {
    this.recommendations.push('👏 मध्यम स्तर में अच्छा! आप अच्छी प्रगति कर रहे हैं।');
  } else if (this.difficultyBreakdown.medium.attempted > 0 && this.difficultyBreakdown.medium.accuracy < 50) {
    this.recommendations.push('📚 मध्यम प्रश्नों पर अधिक अभ्यास करें: विभिन्न प्रकार के प्रश्नों को हल करें।');
  }
  
  if (this.difficultyBreakdown.hard.attempted > 0) {
    if (this.difficultyBreakdown.hard.accuracy >= 50) {
      this.recommendations.push('🌟 कठिन प्रश्नों में उत्कृष्ट! आप चुनौतीपूर्ण समस्याओं को संभाल सकते हैं।');
    } else {
      this.recommendations.push('🎓 कठिन प्रश्नों के लिए: उन्नत तकनीकें सीखें और विशेषज्ञों से मार्गदर्शन लें।');
    }
  }
  
  // 9. OVERALL LEARNING BEHAVIOR RECOMMENDATION
  const overallScore = this.learningBehavior.overallLearningScore;
  if (overallScore >= 80) {
    this.recommendations.push('🎉 उत्कृष्ट सीखने का व्यवहार! आप प्रभावी ढंग से सीख रहे हैं। ऐसे ही जारी रखें!');
  } else if (overallScore >= 60) {
    this.recommendations.push('📈 अच्छा सीखने का दृष्टिकोण। कुछ सुधारों के साथ आप और भी बेहतर कर सकते हैं।');
  } else if (overallScore >= 40) {
    this.recommendations.push('⚡ सीखने की रणनीति में सुधार की आवश्यकता। धीरे-धीरे, सोच-समझकर और नियमित अभ्यास करें।');
  } else {
    this.recommendations.push('📚 सीखने के दृष्टिकोण को बदलें: जल्दबाजी न करें, ध्यान दें और अवधारणाओं को समझें।');
  }
  
  // 10. STRENGTH REINFORCEMENT
  if (this.strengthAreas && this.strengthAreas.length > 0) {
    this.recommendations.push(`💪 अपनी ताकत का उपयोग करें: आप ${this.strengthAreas.join(', ')} में अच्छे हैं। इसे बनाए रखें!`);
  }
};

module.exports = mongoose.model('MATTest', MATTestSchema);
