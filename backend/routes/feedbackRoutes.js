const express = require('express');
const router = express.Router();

const { authenticateUser } = require('../middleware/authentication');

const {
  createFeedback,
  getUserFeedback
} = require('../controllers/feedbackController');

// Route to create feedback is private and requires authentication
router.route('/').post(authenticateUser, createFeedback);

// Route to get a user's feedback is public
router.route('/:userId').get(getUserFeedback);

module.exports = router;