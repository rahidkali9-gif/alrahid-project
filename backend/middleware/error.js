'use strict';

/**
 * Centralized error handler. Handles ApiError, Multer errors,
 * PG errors, JSON parse errors, and generic errors.
 */
const logger = require('../utils/logger');
const config = require('../config');
const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let error = err;

  // Multer errors
  if (err && err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = ApiError.badRequest('File too large');
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      error = ApiError.badRequest('Unexpected file field');
    } else {
      error = ApiError.badRequest(err.message || 'Upload error');
    }
  }

  // JSON parse errors
  if (err && err.type === 'entity.parse.failed') {
    error = ApiError.badRequest('Invalid JSON payload');
  }

  // PG errors
  if (err && err.code && typeof err.code === 'string' && err.code.startsWith('23')) {
    // integrity constraint violations
    if (err.code === '23505') {
      error = ApiError.conflict('Resource already exists', err.detail || err.message);
    } else if (err.code === '23503') {
      error = ApiError.badRequest('Referenced resource not found', err.detail || err.message);
    } else if (err.code === '23514' || err.code === '23502') {
      error = ApiError.unprocessable('Data constraint violation', err.detail || err.message);
    } else {
      error = ApiError.badRequest('Database constraint error', err.detail || err.message);
    }
  }

  // Database connection / network errors
  if (err && (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT' || err.code === 'EAI_AGAIN')) {
    error = ApiError.internal('Service temporarily unavailable');
  }

  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational !== false;

  if (statusCode >= 500) {
    logger.error('Unhandled error', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else if (statusCode >= 400) {
    logger.warn('Client error', {
      message: error.message,
      code: error.code,
      path: req.path,
      method: req.method,
    });
  }

  const body = {
    success: false,
    message: error.message || 'Internal server error',
    error: {
      code: error.code || codeForStatus(statusCode),
    },
    data: null,
    meta: null,
  };

  if (error.details) body.error.details = error.details;

  if (statusCode >= 500 && !config.app.isProd) {
    body.error.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

function codeForStatus(status) {
  const map = { 400: 'BAD_REQUEST', 401: 'UNAUTHORIZED', 403: 'FORBIDDEN', 404: 'NOT_FOUND', 409: 'CONFLICT', 422: 'UNPROCESSABLE', 429: 'RATE_LIMIT', 500: 'INTERNAL' };
  return map[status] || 'ERROR';
}

function notFound(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = { errorHandler, notFound };
