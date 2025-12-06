// models/cycleModel.js
const mongoose = require('mongoose');

const cycleSchema = new mongoose.Schema(
  {
    cycleId: {
      type: Number,
      required: true,
      unique: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'PAUSED'],
      default: 'ACTIVE'
    },
    totalMembers: {
      type: Number,
      required: true  // Should be 100
    },
    paymentPerWeek: {
      type: Number,
      default: 500  // Fixed ₹500
    },
    winnersPerWeek: {
      type: Number,
      default: 2  // Draw 2 winners
    },
    amountPerWinner: {
      type: Number,
      default: 25000  // Each winner gets ₹25,000
    },
    weeksCompleted: {
      type: Number,
      default: 0  // How many weeks passed
    },
    membersWon: {
      type: Number,
      default: 0  // Total members who have won
    },
    remainingChits: {
      type: Number,
      required: true  // Starts at 100, decreases
    },
    totalCollected: {
      type: Number,
      default: 0  // Total money collected
    },
    totalDistributed: {
      type: Number,
      default: 0  // Total money given to winners
    },
    winners: [
      {
        memberId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Member'
        },
        week: Number,
        amount: Number,
        selectedAt: Date
      }
    ],
    endDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for queries
cycleSchema.index({ cycleId: 1 });
cycleSchema.index({ status: 1 });

module.exports = mongoose.model('Cycle', cycleSchema);