const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Each user can only have one profile
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  profilePhotoUrl: {
    type: String,
    default: '/uploads/default-avatar.png', // A default image
  },
  availability: {
    type: String,
    trim: true,
    maxlength: 200,
    default: 'Please specify your availability',
  },
  isPublic: {
    type: Boolean,
    default: true, // Profiles are public by default
  },
  skillsOffered: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Skill',
  }],
  skillsWanted: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Skill',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);