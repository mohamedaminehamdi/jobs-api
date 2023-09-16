const Joi = require('joi');

const create = Joi.object({
  company: Joi.string().trim().max(50).required(),
  position: Joi.string().trim().max(100).required(),
  status: Joi.string().valid('interview', 'declined', 'pending'),
});

const update = Joi.object({
  company: Joi.string().trim().max(50),
  position: Joi.string().trim().max(100),
  status: Joi.string().valid('interview', 'declined', 'pending'),
}).min(1);

module.exports = { create, update };
