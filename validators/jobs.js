const Joi = require('joi');
const { JOB_STATUS, JOB_TYPES, SORT_OPTIONS } = require('../utils/constants');

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

const list = Joi.object({
  status: Joi.string().valid('all', ...JOB_STATUS),
  jobType: Joi.string().valid('all', ...JOB_TYPES),
  search: Joi.string().trim().allow(''),
  sort: Joi.string()
    .valid(...Object.keys(SORT_OPTIONS))
    .default('latest'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const params = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({ 'string.pattern.base': 'Invalid job id: {#value}' }),
});

module.exports = { create, update, list, params };
