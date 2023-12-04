const mongoose = require('mongoose');
const { JOB_STATUS, JOB_TYPES } = require('../utils/constants');

const StatusChangeSchema = new mongoose.Schema(
  {
    status: { type: String, enum: JOB_STATUS, required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

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
    jobUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    salaryMin: {
      type: Number,
      min: 0,
    },
    salaryMax: {
      type: Number,
      min: 0,
    },
    statusHistory: [StatusChangeSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
  },
  { timestamps: true },
);

// keep a timeline of every status the application went through
JobSchema.pre('save', function () {
  if (this.isNew || this.isModified('status')) {
    this.statusHistory.push({ status: this.status });
  }
});

// list queries filter by owner and sort by date
JobSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('Job', JobSchema);
