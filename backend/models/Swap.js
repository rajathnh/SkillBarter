const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    skillOffered: {
      type: mongoose.Schema.ObjectId,
      ref: 'Skill',
      required: true,
    },
    skillWanted: {
      type: mongoose.Schema.ObjectId,
      ref: 'Skill',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    // Optional: A field for an initial message with the request
    message: {
        type: String,
        trim: true,
        maxlength: 500,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Swap', swapSchema);