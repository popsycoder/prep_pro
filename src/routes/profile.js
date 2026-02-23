const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  getUserPurchases,
  getCertificates
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

// All profile routes are protected
router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/avatar', uploadAvatar);
router.get('/purchases', getUserPurchases);
router.get('/certificates', getCertificates);

module.exports = router;