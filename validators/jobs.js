const Joi = require('joi');
const { JOB_STATUS, JOB_TYPES } = require('../utils/constants');

const create = Joi.object({
  company: Joi.string().trim().max(50).required(),
  position: Joi.string().trim().max(100).required(),
  status: Joi.string().valid(...JOB_STATUS),
  jobType: Joi.string().valid(...JOB_TYPES),
  jobLocation: Joi.string().trim().max(100).allow(''),
});

const update = Joi.object({
  company: Joi.string().trim().max(50),
  position: Joi.string().trim().max(100),
  status: Joi.string().valid(...JOB_STATUS),
  jobType: Joi.string().valid(...JOB_TYPES),
  jobLocation: Joi.string().trim().max(100).allow(''),
}).min(1);

const params = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({ 'string.pattern.base': 'Invalid job id: {#value}' }),
});

module.exports = { create, update, params };
