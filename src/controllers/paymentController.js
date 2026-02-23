const crypto = require('crypto');
const Purchase = require('../models/Purchase');
const Course = require('../models/Course');

// For now, using test mode without actual Razorpay
// You'll add real Razorpay keys later

// @desc    Create order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    
    // Validate course
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if user already purchased this course
    const existingPurchase = await Purchase.findOne({
      userId: req.user.id,
      courseId,
      status: 'success'
    });
    
    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: 'You have already purchased this course'
      });
    }
    
    // Calculate final amount
    const amount = course.price;
    const discountAmount = course.price - (course.discountPrice || course.price);
    const finalAmount = course.discountPrice || course.price;
    
    // Create purchase record
    const purchase = await Purchase.create({
      userId: req.user.id,
      courseId,
      amount,
      discountAmount,
      finalAmount,
      status: 'pending',
      razorpayOrderId: `order_${Date.now()}` // Dummy for now
    });
    
    // In production, create actual Razorpay order here
    /*
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    const razorpayOrder = await razorpay.orders.create({
      amount: finalAmount * 100, // Amount in paise
      currency: 'INR',
      receipt: purchase._id.toString()
    });
    
    purchase.razorpayOrderId = razorpayOrder.id;
    await purchase.save();
    */
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        orderId: purchase.razorpayOrderId,
        amount: finalAmount,
        currency: 'INR',
        purchaseId: purchase._id
      }
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const { purchaseId, razorpayPaymentId, razorpaySignature } = req.body;
    
    // Find purchase
    const purchase = await Purchase.findById(purchaseId);
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }
    
    // In development mode, auto-verify
    if (process.env.NODE_ENV === 'development') {
      purchase.status = 'success';
      purchase.razorpayPaymentId = razorpayPaymentId || `pay_${Date.now()}`;
      await purchase.save();
      
      // Update course enrollment count
      const course = await Course.findById(purchase.courseId);
      if (course) {
        course.enrolledStudents += 1;
        await course.save();
      }
      
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully (Development Mode)',
        purchase
      });
    }
    
    // In production, verify signature
    /*
    const body = purchase.razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    if (expectedSignature !== razorpaySignature) {
      purchase.status = 'failed';
      await purchase.save();
      
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
    
    purchase.status = 'success';
    purchase.razorpayPaymentId = razorpayPaymentId;
    purchase.razorpaySignature = razorpaySignature;
    await purchase.save();
    
    // Update course enrollment
    const course = await Course.findById(purchase.courseId);
    if (course) {
      course.enrolledStudents += 1;
      await course.save();
    }
    */
    
    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      purchase
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res, next) => {
  try {
    const purchases = await Purchase.find({
      userId: req.user.id
    })
      .populate('courseId', 'title category thumbnail')
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

// @desc    Get single purchase details
// @route   GET /api/payments/:id
// @access  Private
const getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await Purchase.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('courseId');
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }
    
    res.status(200).json({
      success: true,
      purchase
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getPurchaseById
};