const PDF = require('../models/PDF');
const Testimonial = require('../models/Testimonial');
const StudentPhoto = require('../models/StudentPhoto');

// ========== PDF Controllers ==========

// @desc    Get all PDFs
// @route   GET /api/content/pdfs
// @access  Public
const getAllPDFs = async (req, res, next) => {
  try {
    const { subject } = req.query;
    
    let filter = { isActive: true };
    if (subject) filter.subject = subject;
    
    const pdfs = await PDF.find(filter).sort({ order: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: pdfs.length,
      pdfs
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Download PDF (track download count)
// @route   GET /api/content/pdfs/:id/download
// @access  Public
const downloadPDF = async (req, res, next) => {
  try {
    const pdf = await PDF.findById(req.params.id);
    
    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }
    
    // Increment download count
    pdf.downloadCount += 1;
    await pdf.save();
    
    res.status(200).json({
      success: true,
      pdf: {
        title: pdf.title,
        fileUrl: pdf.fileUrl
      }
    });
    
  } catch (error) {
    next(error);
  }
};

// ========== Testimonial Controllers ==========

// @desc    Get all testimonials
// @route   GET /api/content/testimonials
// @access  Public
const getAllTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(20); // Limit to 20 for carousel
    
    res.status(200).json({
      success: true,
      count: testimonials.length,
      testimonials
    });
    
  } catch (error) {
    next(error);
  }
};

// ========== Student Photo Controllers ==========

// @desc    Get all student photos
// @route   GET /api/content/student-photos
// @access  Public
const getAllStudentPhotos = async (req, res, next) => {
  try {
    const photos = await StudentPhoto.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(12); // 12 photos for carousel
    
    res.status(200).json({
      success: true,
      count: photos.length,
      photos
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPDFs,
  downloadPDF,
  getAllTestimonials,
  getAllStudentPhotos
};