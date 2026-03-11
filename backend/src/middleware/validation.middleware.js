// src/middleware/validation.middleware.js
// Joi schema validation middleware factory

const response = require('../utils/apiResponse');

/**
 * Validate request against a Joi schema
 * @param {object} schema - { body?, query?, params? }
 * @returns Express middleware
 */
const validate = (schema) => (req, res, next) => {
  const errors = [];

  const opts = { abortEarly: false, stripUnknown: true };

  if (schema.body) {
    const { error, value } = schema.body.validate(req.body, opts);
    if (error) {
      errors.push(...error.details.map((d) => ({ field: d.path.join('.'), message: d.message })));
    } else {
      req.body = value;
    }
  }

  if (schema.query) {
    const { error, value } = schema.query.validate(req.query, opts);
    if (error) {
      errors.push(...error.details.map((d) => ({ field: d.path.join('.'), message: d.message })));
    } else {
      req.query = value;
    }
  }

  if (schema.params) {
    const { error, value } = schema.params.validate(req.params, opts);
    if (error) {
      errors.push(...error.details.map((d) => ({ field: d.path.join('.'), message: d.message })));
    } else {
      req.params = value;
    }
  }

  if (errors.length) {
    return response.badRequest(res, 'Validation failed', errors);
  }

  next();
};

module.exports = { validate };