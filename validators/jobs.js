const Joi = require('joi');

const create = Joi.object({
  company: Joi.string().trim().max(50).required(),
  position: Joi.string().trim().max(100).required(),
  status: Joi.string().valid('interview', 'declined', 'pending'),
});

module.exports = { create };
