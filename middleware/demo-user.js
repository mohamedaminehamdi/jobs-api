const { ForbiddenError } = require('../errors');

// the public demo account can browse but not change anything
const blockDemoUser = (req, res, next) => {
  if (req.user.isDemo) {
    throw new ForbiddenError('Demo user is read only');
  }
  next();
};

module.exports = blockDemoUser;
