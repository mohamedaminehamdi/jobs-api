const Joi = require('joi');
const { JOB_STATUS, JOB_TYPES, SORT_OPTIONS } = require('../utils/constants');

const jobFields = {
  company: Joi.string().trim().max(50),
  position: Joi.string().trim().max(100),
  status: Joi.string().valid(...JOB_STATUS),
  jobType: Joi.string().valid(...JOB_TYPES),
  jobLocation: Joi.string().trim().max(100).allow(''),
  notes: Joi.string().trim().max(500).allow(''),
  salaryMin: Joi.number().integer().min(0),
  salaryMax: Joi.number()
    .integer()
    .min(0)
    .when('salaryMin', { is: Joi.exist(), then: Joi.number().min(Joi.ref('salaryMin')) }),
};

const create = Joi.object(jobFields).fork(['company', 'position'], (field) => field.required());

const update = Joi.object(jobFields).min(1);

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
