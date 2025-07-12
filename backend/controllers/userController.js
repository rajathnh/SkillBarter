
const User = require('../models/User');
const Profile = require('../models/Profile');
const Skill = require('../models/Skills');
const Feedback = require('../models/Feedback'); // <-- ADD THIS LINE
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

/**
 * @desc    Get all public user profiles with filtering and pagination
 * @route   GET /api/v1/users
 * @access  Public
 */
const getAllUsers = async (req, res) => {
  const { search, skill } = req.query;

  // Base query object: always find public profiles of non-banned users
  const queryObject = { isPublic: true };
  const userQuery = { isBanned: false };

  if (search) {
    // Add regex for case-insensitive name search on the User model
    userQuery.name = { $regex: search, $options: 'i' };
  }

  // Find users that match the name search first
  const matchingUsers = await User.find(userQuery).select('_id');
  const matchingUserIds = matchingUsers.map(user => user._id);
  
  // Now filter profiles based on these user IDs
  queryObject.user = { $in: matchingUserIds };

  if (skill) {
    // Find the skill ID from the skill name
    const skillDoc = await Skill.findOne({ name: { $regex: `^${skill}$`, $options: 'i' } });
    if (skillDoc) {
      // Add a filter to find profiles that have this skill in either offered or wanted arrays
      queryObject.$or = [
        { skillsOffered: skillDoc._id },
        { skillsWanted: skillDoc._id }
      ];
    } else {
      // If the skill doesn't exist, return no users
      return res.status(StatusCodes.OK).json({ profiles: [], count: 0 });
    }
  }

  // Pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const profiles = await Profile.find(queryObject)
    .populate({
      path: 'user',
      select: 'name email', // Select only public user fields
    })
    .populate({
      path: 'skillsOffered skillsWanted',
      select: 'name',
    })
    .skip(skip)
    .limit(limit);

  const totalProfiles = await Profile.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalProfiles / limit);

  res.status(StatusCodes.OK).json({ profiles, count: totalProfiles, numOfPages });
};


/**
 * @desc    Get a single public user profile WITH their feedback
 * @route   GET /api/v1/users/:id
 * @access  Public
 */
const getSingleUser = async (req, res) => {
  const { id: userId } = req.params;

  // We can fetch the profile and feedback in parallel for better performance
  // Promise.all runs both database queries at the same time.
  const [profile, feedback] = await Promise.all([
    
    // First query: Find the user's profile
    Profile.findOne({ user: userId })
      .populate({
        path: 'user',
        select: 'name createdAt isBanned', // Select the user fields we want to show
      })
      .populate({
        path: 'skillsOffered skillsWanted',
        select: 'name', // Select just the name of the skills
      }),
    
    // Second query: Find all feedback where this user was the one being rated
    Feedback.find({ ratedUser: userId })
      .populate({ 
        path: 'rater', // For the 'rater' field in the feedback...
        select: 'name' // ...populate their name so we can display "Review by John Doe"
      })
      .sort({ createdAt: -1 }) // Show newest feedback first
  ]);


  // If the profile query returned null, the user doesn't exist.
  if (!profile) {
    throw new CustomError.NotFoundError(`No user found with id: ${userId}`);
  }

  // Privacy and security checks
  if (profile.user.isBanned) {
    throw new CustomError.NotFoundError(`No user found with id: ${userId}`);
  }
  if (!profile.isPublic) {
    // Note: An admin could potentially override this, but for now, it's a hard rule.
    throw new CustomError.UnauthorizedError('This user profile is private');
  }

  // If everything is okay, send back a single JSON object containing both results.
  // The 'feedback' variable will be an array (or an empty array if none is found).
  res.status(StatusCodes.OK).json({ profile, feedback });
};


module.exports = {
  getAllUsers,
  getSingleUser,
};