const mongoose = require('mongoose');

const studentPhotoSchema = new mongoose.Schema({
  photoUrl: {
    type: String,
    required: [true, 'Photo URL is required']
  },
  
  caption: {
    type: String,
    trim: true
  },
  
  studentName: String,
  
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

module.exports = mongoose.model('StudentPhoto', studentPhotoSchema);