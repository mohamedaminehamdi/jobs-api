const Joi = require('joi');

const register = Joi.object({
  name: Joi.string().trim().min(3).max(50).required(),
  email: Joi.string().trim().lowercase().email().required(),
  // bcrypt ignores everything after 72 bytes
  password: Joi.string().min(6).max(72).required(),
  lastName: Joi.string().trim().max(50).allow(''),
  location: Joi.string().trim().max(100).allow(''),
});

const login = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

const updateUser = Joi.object({
  name: Joi.string().trim().min(3).max(50),
  email: Joi.string().trim().lowercase().email(),
  lastName: Joi.string().trim().max(50).allow(''),
  location: Joi.string().trim().max(100).allow(''),
}).min(1);

const updatePassword = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(72).required(),
});

const deleteAccount = Joi.object({
  password: Joi.string().required(),
});

module.exports = { register, login, updateUser, updatePassword, deleteAccount };
