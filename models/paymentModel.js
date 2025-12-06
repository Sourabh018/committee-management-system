// models/paymentModel.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      default: 500
    },
    month: {
      type: String,
      required: true,
      enum: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
    },
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['PAID', 'PENDING', 'OVERDUE'],
      default: 'PAID'
    },
    description: {
      type: String,
      default: 'Committee Monthly Payment'
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
paymentSchema.index({ memberId: 1, month: 1 });
paymentSchema.index({ date: -1 });
paymentSchema.index({ month: 1 });

module.exports = mongoose.model('Payment', paymentSchema);