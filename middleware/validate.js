const { BadRequestError } = require('../errors');

// validates req[property] against a Joi schema and replaces it with the cleaned value
const validate =
  (schema, property = 'body') =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      errors: { wrap: { label: false } },
    });
    if (error) {
      throw new BadRequestError(error.details.map((detail) => detail.message).join(', '));
    }
    req[property] = value;
    next();
  };

module.exports = validate;
