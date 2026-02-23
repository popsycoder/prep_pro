const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  
  // Category (MHT-CET, NEET, IIT-JEE)
  category: {
    type: String,
    required: [true, 'Course category is required'],
    enum: ['MHT-CET', 'NEET', 'IIT-JEE']
  },
  
  // Subcategory (PCM, PCB, PCM+B)
  subcategory: {
    type: String,
    required: [true, 'Course subcategory is required'],
    enum: ['PCM', 'PCB', 'PCM+B']
  },
  
  // Pricing
  price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  discountPercent: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Media
  thumbnail: {
    type: String,
    default: 'https://via.placeholder.com/400x200/FF8C42/FFFFFF?text=Course'
  },
  
  // Status
  isLive: {
    type: Boolean,
    default: true
  },
  daysLeft: {
    type: Number,
    default: 365 // Days until course expires
  },
  hasFreeContent: {
    type: Boolean,
    default: false
  },
  
  // Course Details
  description: {
    type: String,
    required: [true, 'Course description is required']
  },
  features: [{
    type: String
  }],
  syllabus: {
    type: String
  },
  
  // Stats
  totalTests: {
    type: Number,
    default: 0
  },
  chaptersCount: {
    type: Number,
    default: 0
  },
  enrolledStudents: {
    type: Number,
    default: 0
  },
  
  // Validity
  validityDays: {
    type: Number,
    default: 365 // Course access validity
  },
  
  // Creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual for calculated discount price
courseSchema.virtual('finalPrice').get(function() {
  if (this.discountPrice) {
    return this.discountPrice;
  }
  if (this.discountPercent) {
    return this.price - (this.price * this.discountPercent / 100);
  }
  return this.price;
});

// Calculate discount percent before saving
courseSchema.pre('save', function(next) {
  if (this.price && this.discountPrice) {
    this.discountPercent = Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);