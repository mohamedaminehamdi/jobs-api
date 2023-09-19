const mongoose = require('mongoose');
const { JOB_STATUS } = require('../utils/constants');

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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Job', JobSchema);
