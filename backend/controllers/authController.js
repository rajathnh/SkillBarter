// backend/controllers/auth.controller.js

const User = require('../models/User');
const Profile = require('../models/Profile'); // <-- IMPORT THE PROFILE MODEL
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser } = require('../utils');

const register = async (req, res) => {
  // ... (all the existing validation code is perfect)
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    throw new CustomError.BadRequestError('Please provide all required fields');
  }
  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already in use');
  }

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'ADMIN' : 'USER';

  // Create the User
  const user = await User.create({ name, email, password, role });

  // --- START: FIX ---
  // Immediately create an associated profile for the new user
  await Profile.create({ user: user._id });
  // --- END: FIX ---

  // ... (the rest of the function is perfect)
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};



const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid credentials');
  }

  const isPasswordCorrect = await user.matchPassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid credentials');
  }
  
  if (user.isBanned) {
    throw new CustomError.UnauthorizedError('This account has been suspended.');
  }

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: 'User logged out successfully!' });
};

module.exports = {
  register,
  login,
  logout,
};