const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { UnauthenticatedError } = require('../errors');

const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();
  res.status(StatusCodes.CREATED).send({ user: { name: user.name }, token });
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
  res.status(StatusCodes.OK).send({ user: { name: user.name }, token });
};
module.exports = {
  register,
  login,
};
