const express = require('express');
const router = express.Router();
const {
  sendOTPController,
  verifyOTPController,
  googleLoginController,
  getMeController
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/send-otp', sendOTPController);
router.post('/verify-otp', verifyOTPController);
router.post('/google-login', googleLoginController);

// Protected routes
router.get('/me', protect, getMeController);

module.exports = router;