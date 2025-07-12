const Feedback = require('../models/Feedback');
const Swap = require('../models/Swap');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

/**
 * @desc    Create feedback for a completed swap
 * @route   POST /api/v1/feedback
 * @access  Private
 */
const createFeedback = async (req, res) => {
  const { swapId, rating, comment } = req.body;
  const raterId = req.user.userId;

  if (!swapId || rating === undefined) {
    throw new CustomError.BadRequestError('Please provide a swap ID and a rating');
  }

  // 1. Find the swap to be reviewed
  const swap = await Swap.findById(swapId);

  if (!swap) {
    throw new CustomError.NotFoundError(`No swap found with id: ${swapId}`);
  }

  // 2. Validation: Check if the swap is actually completed
  if (swap.status !== 'completed') {
    throw new CustomError.BadRequestError('Feedback can only be left for completed swaps');
  }

  // 3. Validation: Check if the current user was part of the swap
  const isRaterTheRequester = swap.requester.toString() === raterId;
  const isRaterTheReceiver = swap.receiver.toString() === raterId;

  if (!isRaterTheRequester && !isRaterTheReceiver) {
    throw new CustomError.UnauthorizedError('You were not a participant in this swap');
  }
  
  // 4. Validation: Check if this swap has already been reviewed
  const existingFeedback = await Feedback.findOne({ swap: swapId });
  if (existingFeedback) {
      throw new CustomError.BadRequestError('This swap has already been reviewed');
  }

  // 5. Determine who is being rated
  const ratedUserId = isRaterTheRequester ? swap.receiver : swap.requester;

  // 6. Create the feedback document
  const feedback = await Feedback.create({
    swap: swapId,
    rater: raterId,
    ratedUser: ratedUserId,
    rating,
    comment,
  });

  res.status(StatusCodes.CREATED).json({ feedback });
};


// Optional: A function to get all feedback for a specific user
/**
 * @desc    Get all feedback received by a user
 * @route   GET /api/v1/feedback/:userId
 * @access  Public
 */
const getUserFeedback = async (req, res) => {
    const { userId } = req.params;

    const feedback = await Feedback.find({ ratedUser: userId })
        .populate({ path: 'rater', select: 'name profilePhotoUrl' }) // Anonymize rater if needed
        .sort({ createdAt: -1 });
    
    // Optional: Calculate average rating
    const averageRating = feedback.reduce((acc, item) => acc + item.rating, 0) / feedback.length;

    res.status(StatusCodes.OK).json({ 
        feedback, 
        count: feedback.length,
        averageRating: averageRating.toFixed(1) || 0
    });
}


module.exports = {
  createFeedback,
  getUserFeedback,
};