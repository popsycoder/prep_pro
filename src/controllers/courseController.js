const Course = require('../models/Course');
const Chapter = require('../models/Chapter');
const Purchase = require('../models/Purchase');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getAllCourses = async (req, res, next) => {
  try {
    const { category, subcategory } = req.query;
    
    let filter = {};
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    
    const courses = await Course.find(filter)
      .select('-createdBy')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course details
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.status(200).json({
      success: true,
      course
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Get course chapters
// @route   GET /api/courses/:id/chapters
// @access  Private (must own course)
const getCourseChapters = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    
    // Check if user has purchased this course
    const hasPurchased = await Purchase.findOne({
      userId: req.user.id,
      courseId,
      status: 'success'
    });
    
    if (!hasPurchased && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Please purchase this course to access chapters'
      });
    }
    
    const chapters = await Chapter.find({ courseId })
      .populate('testId', 'title duration totalQuestions totalMarks')
      .sort({ order: 1 });
    
    // Group by subject
    const groupedChapters = {
      Physics: [],
      Chemistry: [],
      Mathematics: [],
      Biology: []
    };
    
    chapters.forEach(chapter => {
      if (groupedChapters[chapter.subject]) {
        groupedChapters[chapter.subject].push(chapter);
      }
    });
    
    res.status(200).json({
      success: true,
      chapters: groupedChapters,
      totalChapters: chapters.length
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Check if user owns course
// @route   GET /api/courses/:id/check-access
// @access  Private
const checkCourseAccess = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    
    const purchase = await Purchase.findOne({
      userId: req.user.id,
      courseId,
      status: 'success'
    });
    
    res.status(200).json({
      success: true,
      hasAccess: !!purchase,
      purchase: purchase || null
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  getCourseChapters,
  checkCourseAccess
};