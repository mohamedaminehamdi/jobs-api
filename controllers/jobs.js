const Job = require('../models/Job');
const { StatusCodes } = require('http-status-codes');
const { NotFoundError } = require('../errors');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORT_OPTIONS = {
  latest: '-createdAt',
  oldest: 'createdAt',
  'a-z': 'position',
  'z-a': '-position',
};

const getAllJobs = async (req, res) => {
  const { status, jobType, search, sort } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const query = { createdBy: req.user.userId };
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
  const jobs = await Job.find(query)
    .sort(SORT_OPTIONS[sort] || SORT_OPTIONS.latest)
    .skip((page - 1) * limit)
    .limit(limit);
  const totalJobs = await Job.countDocuments(query);
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
  const job = await Job.findOneAndUpdate(
    {
      _id: jobId,
      createdBy: userId,
    },
    req.body,
    { new: true, runValidators: true },
  );
  if (!job) {
    throw new NotFoundError(`No job with id : ${jobId}`);
  }
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
  res.status(StatusCodes.OK).send();
};

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
