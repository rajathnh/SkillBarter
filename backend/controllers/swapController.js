const Swap = require('../models/Swap');
const Profile = require('../models/Profile');
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

  // 1. Validation: Ensure all fields are provided
  if (!receiverId || !skillOfferedId || !skillWantedId) {
    throw new CustomError.BadRequestError('Please provide all required swap details');
  }

  // 2. Validation: A user cannot send a swap request to themselves
  if (requesterId === receiverId) {
    throw new CustomError.BadRequestError('You cannot send a swap request to yourself');
  }
  
  // 3. Validation: Check if the skills are valid for the users involved
  const requesterProfile = await Profile.findOne({ user: requesterId });
  if (!requesterProfile.skillsOffered.includes(skillOfferedId)) {
      throw new CustomError.BadRequestError('You do not offer the selected skill.');
  }

  const receiverProfile = await Profile.findOne({ user: receiverId });
  if (!receiverProfile.skillsWanted.includes(skillWantedId)) {
      throw new CustomError.BadRequestError('The other user does not want the selected skill.');
  }

  // 4. Create the swap request
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
  const swaps = await Swap.find({
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
    .sort({ createdAt: -1 }); // Show most recent swaps first

  res.status(StatusCodes.OK).json({ swaps, count: swaps.length });
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

  // Permission Check: Ensure the current user is part of this swap
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

  // --- Permission Logic ---
  // A receiver can accept or reject a pending request.
  if ((status === 'accepted' || status === 'rejected') && swap.status === 'pending') {
    if (swap.receiver.toString() !== currentUserId) {
      throw new CustomError.UnauthorizedError('Only the receiver can accept or reject a swap request');
    }
  } 
  // A requester can cancel their own pending request.
  else if (status === 'cancelled' && swap.status === 'pending') {
    if (swap.requester.toString() !== currentUserId) {
      throw new CustomError.UnauthorizedError('Only the requester can cancel their own swap request');
    }
  } 
  // Either user can mark an accepted swap as completed.
  else if (status === 'completed' && swap.status === 'accepted') {
    if (swap.requester.toString() !== currentUserId && swap.receiver.toString() !== currentUserId) {
        throw new CustomError.UnauthorizedError('Only participants can complete the swap.');
    }
  }
  // If none of the above conditions are met, the action is invalid.
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