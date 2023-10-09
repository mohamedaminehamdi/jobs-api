const JOB_STATUS = ['pending', 'interview', 'offer', 'declined'];
const JOB_TYPES = ['full-time', 'part-time', 'remote', 'internship'];
// _id breaks ties so pagination stays stable when timestamps collide
const SORT_OPTIONS = {
  latest: '-createdAt -_id',
  oldest: 'createdAt _id',
  'a-z': 'position _id',
  'z-a': '-position -_id',
};

module.exports = { JOB_STATUS, JOB_TYPES, SORT_OPTIONS };
