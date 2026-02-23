const express = require('express');
const router = express.Router();
const {
  getTestById,
  startTest,
  getTestQuestions,
  saveAnswer,
  submitTest,
  getAttemptResult,
  getMyAttempts
} = require('../controllers/testController');
const { protect } = require('../middleware/auth');

// All test routes are protected
router.use(protect);

router.get('/my-attempts', getMyAttempts);
router.get('/:id', getTestById);
router.post('/:id/start', startTest);
router.get('/:id/questions', getTestQuestions);
router.post('/:id/save-answer', saveAnswer);
router.post('/:id/submit', submitTest);
router.get('/attempts/:id', getAttemptResult);

module.exports = router;