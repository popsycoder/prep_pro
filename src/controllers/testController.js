const Test = require('../models/Test');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const Purchase = require('../models/Purchase');

// @desc    Get test details
// @route   GET /api/tests/:id
// @access  Private
const getTestById = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('courseId', 'title category')
      .populate('chapterId', 'title subject');
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }
    
    // Check if user has access to this course
    const hasPurchased = await Purchase.findOne({
      userId: req.user.id,
      courseId: test.courseId._id,
      status: 'success'
    });
    
    if (!hasPurchased && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Please purchase the course to access this test'
      });
    }
    
    // Don't send questions in this response
    const testData = test.toObject();
    
    res.status(200).json({
      success: true,
      test: testData
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Start test (create attempt)
// @route   POST /api/tests/:id/start
// @access  Private
const startTest = async (req, res, next) => {
  try {
    const testId = req.params.id;
    
    const test = await Test.findById(testId);
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }
    
    // Check access
    const hasPurchased = await Purchase.findOne({
      userId: req.user.id,
      courseId: test.courseId,
      status: 'success'
    });
    
    if (!hasPurchased && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Please purchase the course to access this test'
      });
    }
    
    // Check if user already has an ongoing attempt
    const ongoingAttempt = await Attempt.findOne({
      userId: req.user.id,
      testId,
      status: 'ongoing'
    });
    
    if (ongoingAttempt) {
      return res.status(200).json({
        success: true,
        message: 'Resuming existing attempt',
        attempt: ongoingAttempt
      });
    }
    
    // Create new attempt
    const attempt = await Attempt.create({
      userId: req.user.id,
      testId,
      courseId: test.courseId,
      startTime: new Date(),
      totalMarks: test.totalMarks,
      questionStatus: {
        answered: [],
        notAnswered: [],
        markedForReview: [],
        notVisited: Array.from({ length: test.totalQuestions }, (_, i) => i + 1)
      }
    });
    
    // Update test statistics
    test.totalAttempts += 1;
    await test.save();
    
    res.status(201).json({
      success: true,
      message: 'Test started successfully',
      attempt
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Get test questions
// @route   GET /api/tests/:id/questions
// @access  Private (must have active attempt)
const getTestQuestions = async (req, res, next) => {
  try {
    const testId = req.params.id;
    
    // Check if user has an ongoing attempt
    const attempt = await Attempt.findOne({
      userId: req.user.id,
      testId,
      status: 'ongoing'
    });
    
    if (!attempt) {
      return res.status(403).json({
        success: false,
        message: 'No active attempt found. Please start the test first.'
      });
    }
    
    // Get questions (hide solutions)
    const questions = await Question.find({ testId })
      .select('-solution -solutionImage -correctAnswer -correctAnswers')
      .sort({ questionNumber: 1 });
    
    res.status(200).json({
      success: true,
      questions,
      attemptId: attempt._id
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Save answer
// @route   POST /api/tests/:id/save-answer
// @access  Private
const saveAnswer = async (req, res, next) => {
  try {
    const { attemptId, questionId, answer, questionNumber, markedForReview } = req.body;
    
    const attempt = await Attempt.findOne({
      _id: attemptId,
      userId: req.user.id,
      status: 'ongoing'
    });
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found or already submitted'
      });
    }
    
    // Check if answer already exists
    const existingAnswerIndex = attempt.answers.findIndex(
      a => a.questionId.toString() === questionId
    );
    
    if (existingAnswerIndex !== -1) {
      // Update existing answer
      attempt.answers[existingAnswerIndex].answer = answer;
      attempt.answers[existingAnswerIndex].markedForReview = markedForReview || false;
    } else {
      // Add new answer
      attempt.answers.push({
        questionId,
        answer,
        markedForReview: markedForReview || false
      });
    }
    
    // Update question status
    const notVisitedIndex = attempt.questionStatus.notVisited.indexOf(questionNumber);
    if (notVisitedIndex !== -1) {
      attempt.questionStatus.notVisited.splice(notVisitedIndex, 1);
    }
    
    if (markedForReview) {
      if (!attempt.questionStatus.markedForReview.includes(questionNumber)) {
        attempt.questionStatus.markedForReview.push(questionNumber);
      }
    } else {
      if (!attempt.questionStatus.answered.includes(questionNumber)) {
        attempt.questionStatus.answered.push(questionNumber);
      }
      // Remove from markedForReview if it was there
      const reviewIndex = attempt.questionStatus.markedForReview.indexOf(questionNumber);
      if (reviewIndex !== -1) {
        attempt.questionStatus.markedForReview.splice(reviewIndex, 1);
      }
    }
    
    await attempt.save();
    
    res.status(200).json({
      success: true,
      message: 'Answer saved',
      questionStatus: attempt.questionStatus
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Submit test
// @route   POST /api/tests/:id/submit
// @access  Private
const submitTest = async (req, res, next) => {
  try {
    const { attemptId, isAutoSubmit } = req.body;
    
    const attempt = await Attempt.findOne({
      _id: attemptId,
      userId: req.user.id
    });
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }
    
    if (attempt.status !== 'ongoing') {
      return res.status(400).json({
        success: false,
        message: 'Test already submitted'
      });
    }
    
    // Get test details
    const test = await Test.findById(attempt.testId);
    
    // Get all questions with correct answers
    const questions = await Question.find({ testId: attempt.testId });
    
    // Calculate score
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unattempted = test.totalQuestions;
    let score = 0;
    
    attempt.answers.forEach(userAnswer => {
      const question = questions.find(q => q._id.toString() === userAnswer.questionId.toString());
      
      if (question) {
        unattempted--;
        
        if (userAnswer.answer === question.correctAnswer) {
          correctAnswers++;
          userAnswer.isCorrect = true;
          score += test.markingScheme.correct;
        } else {
          wrongAnswers++;
          userAnswer.isCorrect = false;
          score += test.markingScheme.wrong;
        }
      }
    });
    
    // Update attempt
    attempt.endTime = new Date();
    attempt.timeSpent = Math.floor((attempt.endTime - attempt.startTime) / 1000);
    attempt.score = Math.max(0, score); // Ensure score is not negative
    attempt.correctAnswers = correctAnswers;
    attempt.wrongAnswers = wrongAnswers;
    attempt.unattempted = unattempted;
    attempt.status = isAutoSubmit ? 'auto-submitted' : 'submitted';
    
    await attempt.save();
    
    // Update test average score
    const allAttempts = await Attempt.find({
      testId: attempt.testId,
      status: { $ne: 'ongoing' }
    });
    
    const avgScore = allAttempts.reduce((sum, att) => sum + att.score, 0) / allAttempts.length;
    test.averageScore = avgScore;
    await test.save();
    
    res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      result: {
        attemptId: attempt._id,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        percentile: attempt.percentile,
        correctAnswers,
        wrongAnswers,
        unattempted
      }
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Get attempt result
// @route   GET /api/attempts/:id
// @access  Private
const getAttemptResult = async (req, res, next) => {
  try {
    const attempt = await Attempt.findOne({
      _id: req.params.id,
      userId: req.user.id
    })
      .populate('testId', 'title totalMarks markingScheme')
      .populate({
        path: 'answers.questionId',
        select: 'question options correctAnswer solution'
      });
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }
    
    res.status(200).json({
      success: true,
      attempt
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's test history
// @route   GET /api/tests/my-attempts
// @access  Private
const getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({
      userId: req.user.id,
      status: { $ne: 'ongoing' }
    })
      .populate('testId', 'title type')
      .populate('courseId', 'title category')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: attempts.length,
      attempts
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTestById,
  startTest,
  getTestQuestions,
  saveAnswer,
  submitTest,
  getAttemptResult,
  getMyAttempts
};