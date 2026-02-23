const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  
  questionNumber: {
    type: Number,
    required: true
  },
  
  type: {
    type: String,
    enum: ['mcq', 'numerical', 'multi-correct'],
    default: 'mcq'
  },
  
  // Question Content
  passage: {
    type: String
    // Optional - for passage-based questions
  },
  
  question: {
    type: String,
    required: [true, 'Question text is required']
  },
  
  // Options (for MCQ)
  options: [{
    type: String
  }],
  
  // Correct Answer
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required']
  },
  
  // For multi-correct questions
  correctAnswers: [{
    type: String
  }],
  
  // Solution/Explanation
  solution: {
    type: String
  },
  
  solutionImage: {
    type: String
  },
  
  // Marks
  marks: {
    type: Number,
    default: 4
  },
  
  // Difficulty
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  
  // Subject/Topic
  subject: {
    type: String,
    enum: ['Physics', 'Chemistry', 'Mathematics', 'Biology']
  },
  
  topic: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
questionSchema.index({ testId: 1, questionNumber: 1 });

module.exports = mongoose.model('Question', questionSchema);