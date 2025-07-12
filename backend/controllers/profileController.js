const Profile = require('../models/Profile');
const Skill = require('../models/Skills');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

/**
 * @desc    Get the profile of the currently logged-in user
 * @route   GET /api/v1/profile/me
 * @access  Private
 */
const getMyProfile = async (req, res) => {
  const profile = await Profile.findOne({ user: req.user.userId }).populate({
    path: 'skillsOffered skillsWanted',
    select: 'name',
  });

  if (!profile) {
    throw new CustomError.NotFoundError(`No profile found for this user`);
  }

  res.status(StatusCodes.OK).json({ profile });
};

/**
 * @desc    Update the profile of the currently logged-in user
 * @route   PATCH /api/v1/profile/me
 * @access  Private
 */
const updateMyProfile = async (req, res) => {
  const { location, availability, isPublic } = req.body;

  const profile = await Profile.findOne({ user: req.user.userId });

  if (!profile) {
    throw new CustomError.NotFoundError(`No profile found for this user`);
  }

  // Update text fields
  profile.location = location || profile.location;
  profile.availability = availability || profile.availability;
  // Explicitly check for boolean to allow setting to `false`
  if (isPublic !== undefined) {
    profile.isPublic = isPublic;
  }

  // Handle profile photo upload
  if (req.files && req.files.profilePhoto) {
    const profileImage = req.files.profilePhoto;

    // Basic validation for image type
    if (!profileImage.mimetype.startsWith('image')) {
      throw new CustomError.BadRequestError('Please upload an image file');
    }

    // Basic validation for image size
    const maxSize = 1024 * 1024 * 2; // 2MB
    if (profileImage.size > maxSize) {
      throw new CustomError.BadRequestError(
        'Image is too large, please upload an image smaller than 2MB'
      );
    }

    const result = await cloudinary.uploader.upload(profileImage.tempFilePath, {
      use_filename: true,
      folder: 'skill-swap-profiles',
    });

    // Clean up the temporary file
    fs.unlinkSync(profileImage.tempFilePath);
    profile.profilePhotoUrl = result.secure_url;
  }

  await profile.save();
  res.status(StatusCodes.OK).json({ profile });
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