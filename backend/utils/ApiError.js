'use strict';

/**
 * ApiError — operational error class with static factory helpers.
 * Carries a status code, code string, and optional details.
 */
class ApiError extends Error {
  constructor(statusCode, message, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || codeForStatus(statusCode);
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', details = null) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }

  static unauthorized(message = 'Unauthorized', details = null) {
    return new ApiError(401, message, 'UNAUTHORIZED', details);
  }

  static forbidden(message = 'Forbidden', details = null) {
    return new ApiError(403, message, 'FORBIDDEN', details);
  }

  static notFound(message = 'Not found', details = null) {
    return new ApiError(404, message, 'NOT_FOUND', details);
  }

  static conflict(message = 'Conflict', details = null) {
    return new ApiError(409, message, 'CONFLICT', details);
  }

  static unprocessable(message = 'Unprocessable entity', details = null) {
    return new ApiError(422, message, 'UNPROCESSABLE', details);
  }

  static rateLimit(message = 'Too many requests', details = null) {
    return new ApiError(429, message, 'RATE_LIMIT', details);
  }

  static internal(message = 'Internal server error', details = null) {
    return new ApiError(500, message, 'INTERNAL', details);
  }
}

function codeForStatus(status) {
  const map = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE',
    429: 'RATE_LIMIT',
    500: 'INTERNAL',
  };
  return map[status] || 'ERROR';
}

module.exports = ApiError;
