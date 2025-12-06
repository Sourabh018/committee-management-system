// models/messageModel.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['WON', 'ANNOUNCEMENT', 'PAYMENT_REMINDER'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
messageSchema.index({ memberId: 1, read: 1 });
messageSchema.index({ type: 1 });
messageSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Message', messageSchema);