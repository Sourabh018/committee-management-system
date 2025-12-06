// models/winnerModel.js
const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true
    },
    week: {
      type: Number,
      required: true,
      min: 1,
      max: 53
    },
    amountWon: {
      type: Number,
      required: true,
      default: 25000
    },
    status: {
      type: String,
      enum: ['SELECTED', 'CLAIMED', 'UNCLAIMED'],
      default: 'SELECTED'
    }
  },
  {
    timestamps: true
  }
);

// Compound index
winnerSchema.index({ member: 1, week: 1 });
winnerSchema.index({ week: 1 });

module.exports = mongoose.model('Winner', winnerSchema);