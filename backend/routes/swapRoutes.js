const express = require('express');
const router = express.Router();

const { authenticateUser } = require('../middleware/authentication');

const {
  createSwapRequest,
  getMySwaps,
  getSingleSwap,
  updateSwapStatus,
} = require('../controllers/swapController');

// All routes in this file are protected
router.use(authenticateUser);

router.route('/').post(createSwapRequest).get(getMySwaps);
router.route('/:id').get(getSingleSwap).patch(updateSwapStatus);

module.exports = router;