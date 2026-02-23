const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  getCourseChapters,
  checkCourseAccess
} = require('../controllers/courseController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Protected routes
router.get('/:id/chapters', protect, getCourseChapters);
router.get('/:id/check-access', protect, checkCourseAccess);

module.exports = router;