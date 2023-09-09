const rateLimit = require('express-rate-limit');

const limiter = (max) =>
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { msg: 'Too many requests from this IP, please try again after 15 minutes' },
    skip: () => process.env.NODE_ENV === 'test',
  });

module.exports = {
  apiLimiter: limiter(100),
  authLimiter: limiter(10),
};
