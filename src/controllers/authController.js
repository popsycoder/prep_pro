const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendOTP = require('../utils/sendOTP');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Token valid for 30 days
  });
};

// @desc    Send OTP to mobile
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTPController = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    // Validate mobile number
    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number'
      });
    }

    // Find or create user
    let user = await User.findOne({ mobile });

    if (!user) {
      // Create new user
      user = new User({
        mobile,
        authMethod: 'mobile',
        firstName: 'Student' // Temporary, will be updated during profile completion
      });
    }

    // Generate and save OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP
    const otpResult = await sendOTP(mobile, otp);

    if (!otpResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      ...(process.env.NODE_ENV === 'development' && { devOTP: otp }) // Only in dev mode
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and login
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTPController = async (req, res, next) => {
  try {
    const { mobile, otp, firstName } = req.body;

    // Validate input
    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and OTP are required'
      });
    }

    // Find user
    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please request OTP first.'
      });
    }

    // Verify OTP
    const isValidOTP = user.verifyOTP(otp);

    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Update first name if provided
    if (firstName && firstName.trim()) {
      user.firstName = firstName.trim();
    }

    // Clear OTP and mark as verified
    user.clearOTP();
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        mobile: user.mobile,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Google Login
// @route   POST /api/auth/google-login
// @access  Public
const googleLoginController = async (req, res, next) => {
  try {
    const { email, firstName, mobile } = req.body;

    // Validate input
    if (!email || !firstName || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Email, first name, and mobile number are required'
      });
    }

    // Validate mobile
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number'
      });
    }

    // Check if user exists (by email or mobile)
    let user = await User.findOne({
      $or: [{ email }, { mobile }]
    });

    if (user) {
      // Update existing user
      if (!user.email) user.email = email;
      if (!user.firstName || user.firstName === 'Student') {
        user.firstName = firstName;
      }
      if (user.authMethod !== 'google') {
        user.authMethod = 'google';
      }
      user.isVerified = true;
      user.lastLogin = Date.now();
      await user.save();

    } else {
      // Create new user
      user = await User.create({
        email,
        firstName,
        mobile,
        authMethod: 'google',
        isVerified: true,
        lastLogin: Date.now()
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        mobile: user.mobile,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMeController = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-otp -otpExpiry');

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendOTPController,
  verifyOTPController,
  googleLoginController,
  getMeController
};