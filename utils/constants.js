const JOB_STATUS = ['pending', 'interview', 'offer', 'declined'];
const JOB_TYPES = ['full-time', 'part-time', 'remote', 'internship'];
const SORT_OPTIONS = {
  latest: '-createdAt',
  oldest: 'createdAt',
  'a-z': 'position',
  'z-a': '-position',
};

module.exports = { JOB_STATUS, JOB_TYPES, SORT_OPTIONS };
