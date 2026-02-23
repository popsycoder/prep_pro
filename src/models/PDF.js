const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'PDF title is required'],
    trim: true
  },
  
  subject: {
    type: String,
    required: true,
    enum: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'General']
  },
  
  category: {
    type: String,
    enum: ['Formula Sheet', 'Notes', 'Question Bank', 'Solutions', 'Other'],
    default: 'Other'
  },
  
  fileUrl: {
    type: String,
    required: [true, 'PDF file URL is required']
  },
  
  fileSize: {
    type: Number // in bytes
  },
  
  thumbnail: String,
  
  description: String,
  
  downloadCount: {
    type: Number,
    default: 0
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PDF', pdfSchema);