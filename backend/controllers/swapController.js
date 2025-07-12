// backend/controllers/swapController.js

const Swap = require('../models/Swap');
const Profile = require('../models/Profile');
const Feedback = require('../models/Feedback');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

/**
 * @desc    Create a new swap request
 * @route   POST /api/v1/swaps
 * @access  Private
 */
const createSwapRequest = async (req, res) => {
  const { receiverId, skillOfferedId, skillWantedId, message } = req.body;
  const requesterId = req.user.userId;

  if (!receiverId || !skillOfferedId || !skillWantedId) {
    throw new CustomError.BadRequestError('Please provide all required swap details');
  }

  if (requesterId === receiverId) {
    throw new CustomError.BadRequestError('You cannot send a swap request to yourself');
  }
  
  const requesterProfile = await Profile.findOne({ user: requesterId });
  if (!requesterProfile.skillsOffered.includes(skillOfferedId)) {
      throw new CustomError.BadRequestError('You do not offer the selected skill.');
  }

  const receiverProfile = await Profile.findOne({ user: receiverId });
  if (!receiverProfile.skillsOffered.includes(skillWantedId)) {
      throw new CustomError.BadRequestError('The other user does not want the selected skill.');
  }

  const swap = await Swap.create({
    requester: requesterId,
    receiver: receiverId,
    skillOffered: skillOfferedId,
    skillWanted: skillWantedId,
    message,
  });

  res.status(StatusCodes.CREATED).json({ swap });
};

/**
 * @desc    Get all swaps involving the current user (incoming and outgoing)
 * @route   GET /api/v1/swaps
 * @access  Private
 */
const getMySwaps = async (req, res) => {
  // 1. Fetch all potential swaps
  const allSwaps = await Swap.find({
    $or: [{ requester: req.user.userId }, { receiver: req.user.userId }],
  })
    .populate({
      path: 'requester receiver',
      select: 'name email',
    })
    .populate({
      path: 'skillOffered skillWanted',
      select: 'name',
    })
    .sort({ createdAt: -1 });

  // 2. Filter out any "broken" swaps where a referenced document was deleted
  const validSwaps = allSwaps.filter(swap => {
    return (
      swap.requester &&      // check if requester exists
      swap.receiver &&      // check if receiver exists
      swap.skillOffered &&  // check if skillOffered exists
      swap.skillWanted      // check if skillWanted exists
    );
  });

  // 3. Send only the valid, clean swaps to the frontend
  res.status(StatusCodes.OK).json({ swaps: validSwaps, count: validSwaps.length });
};


/**
 * @desc    Get a single swap's details
 * @route   GET /api/v1/swaps/:id
 * @access  Private
 */
const getSingleSwap = async (req, res) => {
  const { id: swapId } = req.params;

  const swap = await Swap.findById(swapId)
    .populate({
      path: 'requester receiver',
      select: 'name email',
    })
    .populate({
      path: 'skillOffered skillWanted',
      select: 'name',
    });

  if (!swap) {
    throw new CustomError.NotFoundError(`No swap found with id: ${swapId}`);
  }

  if (
    swap.requester._id.toString() !== req.user.userId &&
    swap.receiver._id.toString() !== req.user.userId
  ) {
    throw new CustomError.UnauthorizedError('Not authorized to access this swap');
  }

  res.status(StatusCodes.OK).json({ swap });
};

/**
 * @desc    Update the status of a swap (accept, reject, cancel)
 * @route   PATCH /api/v1/swaps/:id
 * @access  Private
 */
const updateSwapStatus = async (req, res) => {
  const { id: swapId } = req.params;
  const { status } = req.body;
  const currentUserId = req.user.userId;

  const validStatuses = ['accepted', 'rejected', 'cancelled', 'completed'];
  if (!status || !validStatuses.includes(status)) {
    throw new CustomError.BadRequestError('Please provide a valid status');
  }

  const swap = await Swap.findById(swapId);

  if (!swap) {
    throw new CustomError.NotFoundError(`No swap found with id: ${swapId}`);
  }

  if ((status === 'accepted' || status === 'rejected') && swap.status === 'pending') {
    if (swap.receiver.toString() !== currentUserId) {
      throw new CustomError.UnauthorizedError('Only the receiver can accept or reject a swap request');
    }
  } 
  else if (status === 'cancelled' && swap.status === 'pending') {
    if (swap.requester.toString() !== currentUserId) {
      throw new CustomError.UnauthorizedError('Only the requester can cancel their own swap request');
    }
  } 
  else if (status === 'completed' && swap.status === 'accepted') {
    if (swap.requester.toString() !== currentUserId && swap.receiver.toString() !== currentUserId) {
        throw new CustomError.UnauthorizedError('Only participants can complete the swap.');
    }
  }
  else {
    throw new CustomError.BadRequestError(`Cannot change status to "${status}" from "${swap.status}"`);
  }

  swap.status = status;
  await swap.save();

  res.status(StatusCodes.OK).json({ swap });
};


module.exports = {
  createSwapRequest,
  getMySwaps,
  getSingleSwap,
  updateSwapStatus,
};