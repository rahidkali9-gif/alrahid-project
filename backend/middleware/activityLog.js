'use strict';

/**
 * Activity log middleware. Records the request after it completes.
 * Skips logging for GET /health and static assets.
 */
const models = require('../models');

const SKIP_PATHS = ['/health', '/favicon.ico'];

function shouldSkip(req) {
  if (req.method === 'GET' && SKIP_PATHS.includes(req.path)) return true;
  if (req.path.startsWith('/uploads/')) return true;
  return false;
}

function activityLog(category, action) {
  return async (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const durationMs = Date.now() - start;
      const meta = {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
      };
      if (req.body && Object.keys(req.body).length) {
        meta.bodyKeys = Object.keys(req.body);
      }
      models.ActivityLog.create({
        userId: req.user ? req.user.id : null,
        category,
        action,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
        metadata: meta,
        durationMs,
      }).catch(() => {
        // never let logging break the request
      });
    });
    next();
  };
}

module.exports = activityLog;
