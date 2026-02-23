const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
    // Optional - null for full-length tests
  },
  
  type: {
    type: String,
    required: true,
    enum: ['chapter', 'full-length'],
    default: 'chapter'
  },
  
  title: {
    type: String,
    required: [true, 'Test title is required'],
    trim: true
  },
  
  subject: {
    type: String,
    enum: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Combined']
  },
  
  // Test Configuration
  duration: {
    type: Number,
    required: [true, 'Test duration is required'],
    min: 1 // Duration in minutes
  },
  
  totalQuestions: {
    type: Number,
    required: [true, 'Total questions is required'],
    min: 1
  },
  
  totalMarks: {
    type: Number,
    required: [true, 'Total marks is required'],
    min: 1
  },
  
  // Marking Scheme
  markingScheme: {
    correct: {
      type: Number,
      default: 4
    },
    wrong: {
      type: Number,
      default: -1
    },
    unattempted: {
      type: Number,
      default: 0
    }
  },
  
  // Instructions
  instructions: {
    type: String,
    default: 'Read all instructions carefully before starting the test.'
  },
  
  // Test Declaration
  declaration: {
    type: String,
    default: 'I have read all the instructions carefully and agree to abide by them.'
  },
  
  // Statistics
  totalAttempts: {
    type: Number,
    default: 0
  },
  
  averageScore: {
    type: Number,
    default: 0
  },
  
  // Availability
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Test', testSchema);