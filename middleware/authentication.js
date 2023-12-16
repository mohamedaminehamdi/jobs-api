const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UnauthenticatedError } = require('../errors');

const auth = async (req, res, next) => {
  const authheader = req.headers.authorization;
  if (!authheader || !authheader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Authentication invalid');
  }
  const token = authheader.split(' ')[1];
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthenticatedError('Token expired, please log in again');
    }
    throw new UnauthenticatedError('Authentication invalid');
  }
  const user = await User.findById(payload.userId).select('passwordChangedAt');
  if (!user) {
    throw new UnauthenticatedError('Authentication invalid');
  }
  if (user.passwordChangedAt && payload.iat * 1000 < user.passwordChangedAt.getTime()) {
    throw new UnauthenticatedError('Password changed, please log in again');
  }
  // attach the user to the request; next() stays outside the try so
  // errors from later middleware are not reported as auth failures
  req.user = { userId: payload.userId, name: payload.name, isDemo: payload.isDemo === true };
  next();
};

module.exports = auth;
