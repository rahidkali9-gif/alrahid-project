'use strict';

/**
 * express-validator result handler. Runs the validation chain and
 * collects errors into a 422 response.
 */
const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const details = errors.array().map((e) => ({ field: e.path, message: e.msg, value: e.value }));
  next(ApiError.unprocessable('Validation failed', details));
}

module.exports = validate;
