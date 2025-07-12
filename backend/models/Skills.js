const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a skill name'],
    unique: true,
    trim: true,
  },
  // Optional: A field to mark if a skill needs admin approval
  isApproved: {
    type: Boolean,
    default: true,
  }
});

module.exports = mongoose.model('Skill', skillSchema);