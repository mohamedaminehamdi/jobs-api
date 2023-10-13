const Joi = require('joi');

const register = Joi.object({
  name: Joi.string().trim().min(3).max(50).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).required(),
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

module.exports = { register, login, updateUser };
