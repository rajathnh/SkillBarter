const User = require('../models/User');
const Swap = require('../models/Swap');
const Skill = require('../models/Skills');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

/**
 * @desc    Get a list of all users for the admin
 * @route   GET /api/v1/admin/users
 * @access  Private (Admin)
 */
const getAllUsersForAdmin = async (req, res) => {
  const users = await User.find({}).select('-password'); // Exclude passwords
  res.status(StatusCodes.OK).json({ users, count: users.length });
};

/**
 * @desc    Ban or un-ban a user
 * @route   PATCH /api/v1/admin/users/:id/ban
 * @access  Private (Admin)
 */
const toggleBanUser = async (req, res) => {
  const { id: userId } = req.params;

  // Prevent admin from banning themselves
  if (req.user.userId === userId) {
    throw new CustomError.BadRequestError('Admin cannot ban themselves');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id: ${userId}`);
  }

  // Toggle the ban status
  user.isBanned = !user.isBanned;
  await user.save();

  const message = user.isBanned ? 'User has been banned' : 'User has been un-banned';
  res.status(StatusCodes.OK).json({ msg: message, user: { _id: user._id, name: user.name, isBanned: user.isBanned } });
};


/**
 * @desc    Get all swaps on the platform for monitoring
 * @route   GET /api/v1/admin/swaps
 * @access  Private (Admin)
 */
const getAllSwapsForAdmin = async (req, res) => {
  const { status } = req.query;
  const queryObject = {};

  if (status) {
    queryObject.status = status;
  }

  const swaps = await Swap.find(queryObject)
    .populate('requester receiver', 'name email')
    .populate('skillOffered skillWanted', 'name');

  res.status(StatusCodes.OK).json({ swaps, count: swaps.length });
};


/**
 * @desc    Reject (disapprove) a spammy skill description
 * @route   PATCH /api/v1/admin/skills/:id/reject
 * @access  Private (Admin)
 */
const toggleSkillApproval = async (req, res) => {
    const { id: skillId } = req.params;
    const skill = await Skill.findById(skillId);

    if (!skill) {
        throw new CustomError.NotFoundError(`No skill with id: ${skillId}`);
    }

    // Toggle approval status
    skill.isApproved = !skill.isApproved;
    await skill.save();

    const message = skill.isApproved ? 'Skill has been approved' : 'Skill has been rejected';
    res.status(StatusCodes.OK).json({ msg: message, skill });
};


module.exports = {
  getAllUsersForAdmin,
  toggleBanUser,
  getAllSwapsForAdmin,
  toggleSkillApproval,
};