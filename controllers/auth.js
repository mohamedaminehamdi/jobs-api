const User = require('../models/User');
const Job = require('../models/Job');
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

const updateUser = async (req, res) => {
  const user = await findCurrentUser(req);
  // body is already restricted to profile fields by the validator
  Object.assign(user, req.body);
  await user.save();
  // the token carries the name, so issue a fresh one
  res.status(StatusCodes.OK).json({ user: profile(user), token: user.createJWT() });
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await findCurrentUser(req);
  const isPasswordCorrect = await user.matchPasswords(oldPassword);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid credentials');
  }
  user.password = newPassword;
  await user.save();
  // tokens issued before the change are rejected from now on, so hand out a new one
  res.status(StatusCodes.OK).json({ msg: 'Password updated', token: user.createJWT() });
};

const deleteAccount = async (req, res) => {
  const user = await findCurrentUser(req);
  const isPasswordCorrect = await user.matchPasswords(req.body.password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid credentials');
  }
  await Job.deleteMany({ createdBy: user._id });
  await user.deleteOne();
  res.status(StatusCodes.OK).json({ msg: 'Account deleted' });
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateUser,
  updatePassword,
  deleteAccount,
};
