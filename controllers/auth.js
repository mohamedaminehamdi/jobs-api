const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { UnauthenticatedError } = require('../errors');

const profile = ({ name, lastName, email, location }) => ({ name, lastName, email, location });

const findCurrentUser = async (req) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new UnauthenticatedError('Authentication invalid');
  }
  return user;
};

const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();
  res.status(StatusCodes.CREATED).json({ user: profile(user), token });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError('Invalid credentials');
  }
  const isPasswordCorrect = await user.matchPasswords(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid credentials');
  }
  const token = user.createJWT();
  res.status(StatusCodes.OK).json({ user: profile(user), token });
};

const getCurrentUser = async (req, res) => {
  const user = await findCurrentUser(req);
  res.status(StatusCodes.OK).json({ user: profile(user) });
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
