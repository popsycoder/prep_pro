const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  chapterNumber: {
    type: Number,
    required: true
  },
  
  subject: {
    type: String,
    required: true,
    enum: ['Physics', 'Chemistry', 'Mathematics', 'Biology']
  },
  
  title: {
    type: String,
    required: [true, 'Chapter title is required'],
    trim: true
  },
  
  // Associated test
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test'
  },
  
  // Order in course
  order: {
    type: Number,
    required: true
  },
  
  // Chapter materials
  materials: [{
    type: {
      type: String,
      enum: ['pdf', 'video', 'notes']
    },
    title: String,
    url: String
  }]
}, {
  timestamps: true
});

// Index for efficient querying
chapterSchema.index({ courseId: 1, order: 1 });

module.exports = mongoose.model('Chapter', chapterSchema);