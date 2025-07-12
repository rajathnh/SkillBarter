const Profile = require('../models/Profile');
const Skill = require('../models/Skills');
const User = require('../models/User'); // <-- IMPORT USER
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { createTokenUser, attachCookiesToResponse } = require('../utils'); // <-- IMPORT UTILS

/**
 * @desc    Get the profile of the currently logged-in user
 * @route   GET /api/v1/profile/me
 * @access  Private
 */
const getMyProfile = async (req, res) => {
  const profile = await Profile.findOne({ user: req.user.userId }).populate({
    path: 'skillsOffered skillsWanted',
    select: 'name',
  }).populate({ // Also populate the user details
    path: 'user',
    select: 'name email'
  });

  if (!profile) {
    throw new CustomError.NotFoundError(`No profile found for this user`);
  }

  res.status(StatusCodes.OK).json({ profile });
};

/**
 * @desc    Update the profile of the currently logged-in user (now handles name and photo)
 * @route   PATCH /api/v1/profile/me
 * @access  Private
 */
const updateMyProfile = async (req, res) => {
  // Destructure name from body as well
  const { location, availability, isPublic, name } = req.body;
  const { userId } = req.user;

  const profile = await Profile.findOne({ user: userId });
  if (!profile) {
    throw new CustomError.NotFoundError(`No profile found for this user`);
  }
  
  const userToUpdate = await User.findById(userId);
  if (!userToUpdate) {
      throw new CustomError.NotFoundError(`No user found for this profile`);
  }

  // Update the user's name on the User model if provided
  if (name) {
    userToUpdate.name = name;
  }

  // Update profile text fields
  profile.location = location !== undefined ? location : profile.location;
  profile.availability = availability !== undefined ? availability : profile.availability;
  if (isPublic !== undefined) {
    profile.isPublic = isPublic;
  }

  // Handle profile photo upload
  if (req.files && req.files.profilePhoto) {
    const profileImage = req.files.profilePhoto;

    if (!profileImage.mimetype.startsWith('image')) {
      throw new CustomError.BadRequestError('Please upload an image file');
    }

    const maxSize = 1024 * 1024 * 5; // 5MB
    if (profileImage.size > maxSize) {
      throw new CustomError.BadRequestError('Image is too large, please upload an image smaller than 5MB');
    }

    const result = await cloudinary.uploader.upload(profileImage.tempFilePath, {
      use_filename: true,
      folder: 'skill-swap-profiles',
      resource_type: 'image'
    });

    fs.unlinkSync(profileImage.tempFilePath);
    profile.profilePhotoUrl = result.secure_url;
  }

  await profile.save();
  await userToUpdate.save();

  // Re-issue the token with the potentially new name
  const tokenUser = createTokenUser(userToUpdate);
  attachCookiesToResponse({ res, user: tokenUser });

  // Send back the updated user object for the frontend to use
  res.status(StatusCodes.OK).json({ profile, user: tokenUser });
};


/**
 * @desc    Add a skill to the current user's profile
 * @route   POST /api/v1/profile/me/skills
 * @access  Private
 */
const addMySkill = async (req, res) => {
  const { skillName, type } = req.body;

  if (!skillName || !type) {
    throw new CustomError.BadRequestError('Please provide skill name and type (offered/wanted)');
  }

  if (type !== 'offered' && type !== 'wanted') {
    throw new CustomError.BadRequestError('Type must be either "offered" or "wanted"');
  }

  // Find or create the skill in the master Skill collection to ensure no duplicates
  const skill = await Skill.findOneAndUpdate(
    { name: { $regex: new RegExp(`^${skillName}$`, 'i') } }, // Case-insensitive match
    { $setOnInsert: { name: skillName } },
    { upsert: true, new: true, runValidators: true }
  );

  // Add the skill to the correct array in the user's profile
  const updateField = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
  const profile = await Profile.findOneAndUpdate(
    { user: req.user.userId },
    { $addToSet: { [updateField]: skill._id } }, // $addToSet prevents duplicates
    { new: true }
  );

  if (!profile) {
    throw new CustomError.NotFoundError(`No profile found for this user`);
  }

  res.status(StatusCodes.OK).json({ msg: 'Skill added successfully!', profile });
};

/**
 * @desc    Remove a skill from the current user's profile
 * @route   DELETE /api/v1/profile/me/skills/:skillId
 * @access  Private
 */
const removeMySkill = async (req, res) => {
  const { skillId } = req.params;

  const profile = await Profile.findOneAndUpdate(
    { user: req.user.userId },
    {
      $pull: {
        skillsOffered: skillId,
        skillsWanted: skillId,
      },
    },
    { new: true }
  );

  if (!profile) {
    throw new CustomError.NotFoundError(`No profile found for this user`);
  }

  res.status(StatusCodes.OK).json({ msg: 'Skill removed successfully!', profile });
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  addMySkill,
  removeMySkill,
};