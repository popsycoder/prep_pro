const User = require('../models/User');
const Purchase = require('../models/Purchase');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res, next) => {
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

// @desc    Update profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'firstName',
      'email',
      'profile.dateOfBirth',
      'profile.gender',
      'profile.nationality',
      'profile.bloodGroup',
      'profile.aadharNumber',
      'profile.permanentAddress',
      'profile.correspondenceAddress',
      'profile.education'
    ];
    
    const user = await User.findById(req.user.id);
    
    // Update allowed fields
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key.includes('.')) {
          // Handle nested fields
          const [parent, child] = key.split('.');
          if (!user[parent]) user[parent] = {};
          user[parent][child] = req.body[key];
        } else {
          user[key] = req.body[key];
        }
      }
    });
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar
// @route   POST /api/profile/avatar
// @access  Private
const uploadAvatar = async (req, res, next) => {
  try {
    const { avatarUrl } = req.body;
    
    // In production, handle file upload with multer + cloudinary
    // For now, just accept URL
    
    const user = await User.findById(req.user.id);
    user.avatar = avatarUrl;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      avatar: user.avatar
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's purchased courses
// @route   GET /api/profile/purchases
// @access  Private
const getUserPurchases = async (req, res, next) => {
  try {
    const purchases = await Purchase.find({
      userId: req.user.id,
      status: 'success'
    })
      .populate('courseId')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: purchases.length,
      purchases
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Get user certificates
// @route   GET /api/profile/certificates
// @access  Private
const getCertificates = async (req, res, next) => {
  try {
    // Placeholder - implement certificate generation later
    res.status(200).json({
      success: true,
      message: 'Certificates feature coming soon',
      certificates: []
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  getUserPurchases,
  getCertificates
};