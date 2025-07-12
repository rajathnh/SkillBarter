const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  swap: {
    type: mongoose.Schema.ObjectId,
    ref: 'Swap',
    required: true,
    unique: true, // A swap can only be reviewed once
  },
  rater: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  ratedUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please provide a rating between 1 and 5'],
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
}, { timestamps: true });

// Optional: Add a hook to calculate the average rating for a user after a new feedback is saved.
// This is an advanced optimization but very useful. We can add it later if you like.

module.exports = mongoose.model('Feedback', feedbackSchema);