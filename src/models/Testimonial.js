const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  
  studentPhoto: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  
  exam: {
    type: String,
    required: true,
    enum: ['MHT-CET', 'NEET', 'JEE-Mains', 'JEE-Advanced', 'Other']
  },
  
  college: {
    type: String,
    trim: true
  },
  
  rank: String,
  
  score: String,
  
  message: {
    type: String,
    required: [true, 'Testimonial message is required']
  },
  
  order: {
    type: Number,
    default: 0
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Testimonial', testimonialSchema);