const mongoose = require('mongoose');
const Job = require('../models/Job');
const { StatusCodes } = require('http-status-codes');
const { NotFoundError } = require('../errors');
const { JOB_STATUS, SORT_OPTIONS } = require('../utils/constants');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildListQuery = (userId, { status, jobType, search, from, to }) => {
  const query = { createdBy: userId };
  if (status && status !== 'all') {
    query.status = status;
  }
  if (jobType && jobType !== 'all') {
    query.jobType = jobType;
  }
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    query.$or = [{ position: pattern }, { company: pattern }];
  }
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = from;
    if (to) query.createdAt.$lte = to;
  }
  return query;
};

const getAllJobs = async (req, res) => {
  const { sort, page, limit } = req.query;
  const query = buildListQuery(req.user.userId, req.query);
  const [jobs, totalJobs] = await Promise.all([
    Job.find(query)
      .sort(SORT_OPTIONS[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Job.countDocuments(query),
  ]);
  res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages: Math.ceil(totalJobs / limit) });
};

const getJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;
  const job = await Job.findOne({
    _id: jobId,
    createdBy: userId,
  });
  if (!job) {
    throw new NotFoundError(`No job with id : ${jobId}`);
  }
  res.status(StatusCodes.OK).json({ job });
};

const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;
  const job = await Job.findOne({ _id: jobId, createdBy: userId });
  if (!job) {
    throw new NotFoundError(`No job with id : ${jobId}`);
  }
  // save() instead of findOneAndUpdate so the status history hook runs
  job.set(req.body);
  await job.save();
  res.status(StatusCodes.OK).json({ job });
};

const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;
  const job = await Job.findOneAndDelete({
    _id: jobId,
    createdBy: userId,
  });
  if (!job) {
    throw new NotFoundError(`No job with id : ${jobId}`);
  }
  res.status(StatusCodes.OK).json({ msg: 'Job removed' });
};

const showStats = async (req, res) => {
  const createdBy = new mongoose.Types.ObjectId(req.user.userId);
  const counts = await Job.aggregate([
    { $match: { createdBy } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const defaultStats = Object.fromEntries(JOB_STATUS.map((status) => [status, 0]));
  counts.forEach(({ _id, count }) => {
    defaultStats[_id] = count;
  });

  // six most recent months that have applications, oldest first
  const monthly = await Job.aggregate([
    { $match: { createdBy } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);
  const monthlyApplications = monthly.reverse().map(({ _id: { year, month }, count }) => ({
    date: `${year}-${String(month).padStart(2, '0')}`,
    count,
  }));

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  showStats,
};
