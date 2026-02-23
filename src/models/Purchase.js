const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: true
  },
  
  discountAmount: {
    type: Number,
    default: 0
  },
  
  finalAmount: {
    type: Number,
    required: true
  },
  
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'upi', 'card', 'netbanking'],
    default: 'razorpay'
  },
  
  // Razorpay Details
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  
  // Payment Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed'],
    default: 'pending'
  },
  
  // Validity
  validFrom: {
    type: Date,
    default: Date.now
  },
  
  validTill: {
    type: Date
  }
}, {
  timestamps: true
});

// Set validity period before saving
purchaseSchema.pre('save', async function(next) {
  if (this.isNew && this.status === 'success') {
    const Course = mongoose.model('Course');
    const course = await Course.findById(this.courseId);
    
    if (course) {
      this.validTill = new Date(Date.now() + course.validityDays * 24 * 60 * 60 * 1000);
    }
  }
  next();
});

module.exports = mongoose.model('Purchase', purchaseSchema);