const express = require('express');
const router = express.Router();
const {
  getAllPDFs,
  downloadPDF,
  getAllTestimonials,
  getAllStudentPhotos
} = require('../controllers/contentController');

// All content routes are public
router.get('/pdfs', getAllPDFs);
router.get('/pdfs/:id/download', downloadPDF);
router.get('/testimonials', getAllTestimonials);
router.get('/student-photos', getAllStudentPhotos);

module.exports = router;