const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info (Required)
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },

  // Auth Method
  authMethod: {
    type: String,
    enum: ['mobile', 'google'],
    default: 'mobile'
  },

  // OTP for mobile authentication
  otp: String,
  otpExpiry: Date,
  isVerified: {
    type: Boolean,
    default: false
  },

  // Profile Picture
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/150/FF8C42/FFFFFF?text=User'
  },

  // Personal Details (Optional - filled later)
  profile: {
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other']
    },
    nationality: String,
    bloodGroup: String,
    aadharNumber: String,
    signature: String,

    // Address
    permanentAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pinCode: String
    },
    correspondenceAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pinCode: String
    },

    // Education
    education: {
      class10: {
        schoolName: String,
        board: String,
        percentage: Number,
        resultDocument: String
      },
      class12: {
        collegeName: String,
        board: String,
        percentage: Number,
        resultDocument: String
      }
    }
  },

  // User Role
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Generate OTP
userSchema.methods.generateOTP = function() {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function(enteredOTP) {
  if (!this.otp || !this.otpExpiry) {
    return false;
  }
  
  if (Date.now() > this.otpExpiry) {
    return false; // OTP expired
  }
  
  return this.otp === enteredOTP;
};

// Clear OTP after verification
userSchema.methods.clearOTP = function() {
  this.otp = undefined;
  this.otpExpiry = undefined;
  this.isVerified = true;
};

module.exports = mongoose.model('User', userSchema);