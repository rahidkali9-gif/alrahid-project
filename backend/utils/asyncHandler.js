'use strict';

/**
 * asyncHandler — wraps an async controller so rejected promises are
 * forwarded to Express's error middleware.
 */
const ApiError = require('./ApiError');

/**
 * @param {Function} fn (req, res, next) => Promise
 * @returns {Function} Express middleware
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      // Normalize non-Error throws (strings, plain objects)
      if (!(err instanceof Error)) {
        return next(ApiError.internal(typeof err === 'string' ? err : 'Unexpected error'));
      }
      next(err);
    });
  };
}

module.exports = asyncHandler;
