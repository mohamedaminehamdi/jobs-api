const mongoose = require('mongoose');
const { JOB_STATUS, JOB_TYPES } = require('../utils/constants');

const JobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Please provide a company'],
      maxlength: 50,
    },
    position: {
      type: String,
      required: [true, 'Please provide a Position'],
      maxlength: 100,
    },
    status: {
      type: String,
      enum: JOB_STATUS,
      default: 'pending',
    },
    jobType: {
      type: String,
      enum: JOB_TYPES,
      default: 'full-time',
    },
    jobLocation: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
  },
  { timestamps: true },
);

// list queries filter by owner and sort by date
JobSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('Job', JobSchema);
