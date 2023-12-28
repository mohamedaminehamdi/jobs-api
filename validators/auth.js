const Joi = require('joi');

const email = Joi.string().trim().lowercase().email();
// bcrypt ignores everything after 72 bytes
const newPassword = Joi.string().min(6).max(72);

const profileFields = {
  name: Joi.string().trim().min(3).max(50),
  email,
  lastName: Joi.string().trim().max(50).allow(''),
  location: Joi.string().trim().max(100).allow(''),
};

const register = Joi.object({ ...profileFields, password: newPassword.required() }).fork(
  ['name', 'email'],
  (field) => field.required(),
);

const login = Joi.object({
  email: email.required(),
  password: Joi.string().required(),
});

const updateUser = Joi.object(profileFields).min(1);

const updatePassword = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: newPassword.required(),
});

const deleteAccount = Joi.object({
  password: Joi.string().required(),
});

module.exports = { register, login, updateUser, updatePassword, deleteAccount };
