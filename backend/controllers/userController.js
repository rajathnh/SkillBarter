const User = require('../models/User');
const Profile = require('../models/Profile');
const Skill = require('../models/Skills');
const Feedback = require('../models/Feedback'); 
const mongoose = require('mongoose'); // <-- IMPORT MONGOOSE
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

/**
 * @desc    Get all public user profiles with filtering, pagination, and ratings
 * @route   GET /api/v1/users
 * @access  Public
 */
const getAllUsers = async (req, res) => {
  const { search } = req.query;

  // Base Match Stage
  const baseMatch = {
    isPublic: true,
    'user.isBanned': false,
  };

  if (search) {
    // If searching, add a condition to match user's name OR skill's name
    const skillIds = await Skill.find({ name: { $regex: search, $options: 'i' } }).select('_id');
    baseMatch.$or = [
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'skillsOffered': { $in: skillIds.map(s => s._id) } },
        { 'skillsWanted': { $in: skillIds.map(s => s._id) } },
    ];
  }
  
  // Pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Aggregation Pipeline
  let pipeline = [
    // Stage 1: Join with 'users' collection
    {
      $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' },
    },
    // Stage 2: Deconstruct the user array to a single object
    { $unwind: '$user' },
    // Stage 3: Join with 'skills' for skillsOffered
    {
        $lookup: { from: 'skills', localField: 'skillsOffered', foreignField: '_id', as: 'skillsOffered' }
    },
    // Stage 4: Join with 'skills' for skillsWanted
    {
        $lookup: { from: 'skills', localField: 'skillsWanted', foreignField: '_id', as: 'skillsWanted' }
    },
    // Stage 5: Filter for public, non-banned users and apply search
    { $match: baseMatch },
    // Stage 6: Join with 'feedbacks' to calculate ratings
    {
      $lookup: { from: 'feedbacks', localField: 'user._id', foreignField: 'ratedUser', as: 'feedback' },
    },
    // Stage 7: Add calculated fields for rating
    {
      $addFields: {
        averageRating: { $ifNull: [ { $avg: '$feedback.rating' }, 0 ] },
        ratingCount: { $size: '$feedback' },
      },
    },
    // Stage 8: Project the final fields to send to the frontend
    {
      $project: {
        'user.password': 0, // Ensure password is not sent
        feedback: 0, // Do not send the full feedback array
      },
    },
  ];

  // Pipeline for counting total documents matching the query
  const countPipeline = [...pipeline, { $count: 'total' }];
  const totalProfilesResult = await Profile.aggregate(countPipeline);
  const totalProfiles = totalProfilesResult.length > 0 ? totalProfilesResult[0].total : 0;
  const numOfPages = Math.ceil(totalProfiles / limit);

  // Add sorting, skipping, and limiting for pagination to the main pipeline
  pipeline.push({ $sort: { createdAt: -1 } });
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });
  
  const profiles = await Profile.aggregate(pipeline);

  res.status(StatusCodes.OK).json({ profiles, count: totalProfiles, numOfPages });
};


/**
 * @desc    Get a single public user profile WITH their feedback
 * @route   GET /api/v1/users/:id
 * @access  Public
 */
const getSingleUser = async (req, res) => {
  const { id: userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError.BadRequestError('Invalid user ID format');
  }

  const [profile, feedback] = await Promise.all([
    Profile.findOne({ user: userId })
      .populate({ path: 'user', select: 'name createdAt isBanned' })
      .populate({ path: 'skillsOffered skillsWanted', select: 'name' }),
    
    Feedback.find({ ratedUser: userId })
      .populate({ path: 'rater', select: 'name' })
      .sort({ createdAt: -1 })
  ]);

  if (!profile || !profile.user) {
    throw new CustomError.NotFoundError(`No user found with id: ${userId}`);
  }

  if (profile.user.isBanned) {
    throw new CustomError.NotFoundError(`This user account is not available.`);
  }
  if (!profile.isPublic) {
    throw new CustomError.UnauthorizedError('This user profile is private');
  }

  res.status(StatusCodes.OK).json({ profile, feedback });
};


module.exports = {
  getAllUsers,
  getSingleUser,
};