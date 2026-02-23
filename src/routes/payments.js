const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getPurchaseById
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// All payment routes are protected
router.use(protect);

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/history', getPaymentHistory);
router.get('/:id', getPurchaseById);

module.exports = router;