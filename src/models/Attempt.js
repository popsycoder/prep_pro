const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  // Timing
  startTime: {
    type: Date,
    required: true
  },
  
  endTime: {
    type: Date
  },
  
  timeSpent: {
    type: Number // in seconds
  },
  
  // Answers
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    answer: String,
    isCorrect: Boolean,
    timeTaken: Number, // seconds spent on this question
    markedForReview: {
      type: Boolean,
      default: false
    }
  }],
  
  // Question Palette Status
  questionStatus: {
    answered: [Number], // Question numbers
    notAnswered: [Number],
    markedForReview: [Number],
    notVisited: [Number]
  },
  
  // Results
  score: {
    type: Number,
    default: 0
  },
  
  totalMarks: {
    type: Number,
    required: true
  },
  
  percentage: {
    type: Number,
    default: 0
  },
  
  percentile: {
    type: Number,
    default: 0
  },
  
  // Statistics
  correctAnswers: {
    type: Number,
    default: 0
  },
  
  wrongAnswers: {
    type: Number,
    default: 0
  },
  
  unattempted: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['ongoing', 'submitted', 'auto-submitted'],
    default: 'ongoing'
  }
}, {
  timestamps: true
});

// Calculate percentile before saving
attemptSchema.pre('save', async function(next) {
  if (this.isModified('score') && this.status !== 'ongoing') {
    // Calculate percentage
    this.percentage = (this.score / this.totalMarks) * 100;
    
    // Calculate percentile (simplified - compare with all attempts of this test)
    const Attempt = mongoose.model('Attempt');
    const allAttempts = await Attempt.find({
      testId: this.testId,
      status: { $ne: 'ongoing' }
    }).select('score');
    
    const lowerScores = allAttempts.filter(a => a.score < this.score).length;
    const totalAttempts = allAttempts.length;
    
    this.percentile = totalAttempts > 0 
      ? (lowerScores / totalAttempts) * 100 
      : 0;
  }
  next();
});

module.exports = mongoose.model('Attempt', attemptSchema);