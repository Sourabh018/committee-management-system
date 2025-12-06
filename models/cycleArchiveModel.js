// models/cycleArchiveModel.js - NEW FILE
const mongoose = require('mongoose');

const cycleArchiveSchema = new mongoose.Schema(
  {
    cycleNumber: {
      type: Number,
      required: true,
      unique: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    totalMembers: {
      type: Number,
      required: true
    },
    totalWeeks: {
      type: Number,
      required: true
    },
    depositPerMember: {
      type: Number,
      default: 500
    },
    winnersPerDraw: {
      type: Number,
      default: 2
    },
    // Archive all winners from this cycle
    winners: [{
      memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
      },
      memberName: String,
      memberPhone: String,
      week: Number,
      amountWon: Number,
      drawnOn: Date,
      status: String
    }],
    // Statistics
    totalPrizeDistributed: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'ARCHIVED'],
      default: 'ARCHIVED'
    }
  },
  {
    timestamps: true
  }
);

cycleArchiveSchema.index({ cycleNumber: 1 });
cycleArchiveSchema.index({ endDate: -1 });

module.exports = mongoose.model('CycleArchive', cycleArchiveSchema);