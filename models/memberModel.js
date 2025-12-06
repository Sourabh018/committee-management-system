// models/memberModel.js
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,  // ← ENFORCE UNIQUE PHONE
      index: true,
      sparse: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE'
    },
    // Chit tracking fields
    chitRemoved: {
      type: Boolean,
      default: false,
      index: true
    },
    wonInWeek: {
      type: Number,
      default: null
    },
    wonAmount: {
      type: Number,
      default: 0
    },
    wonDate: {
      type: Date,
      default: null
    },
    cycleId: {
      type: Number,
      default: 1,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
memberSchema.index({ name: 1 });
memberSchema.index({ phone: 1 }, { unique: true });
memberSchema.index({ chitRemoved: 1 });
memberSchema.index({ cycleId: 1 });

// Handle duplicate key error
memberSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    next(new Error(`Duplicate ${field}: This ${field} already exists`));
  } else {
    next(error);
  }
});

module.exports = mongoose.model('Member', memberSchema);