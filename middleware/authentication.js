const jwt = require('jsonwebtoken');
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
    throw new UnauthenticatedError('Authentication invalid');
  }
  // attach the user to the request; next() stays outside the try so
  // errors from later middleware are not reported as auth failures
  req.user = { userId: payload.userId, name: payload.name, isDemo: payload.isDemo === true };
  next();
};

module.exports = auth;
