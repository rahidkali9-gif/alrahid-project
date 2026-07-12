'use strict';

/**
 * Authentication middleware.
 * - authenticate: requires a valid Bearer JWT; loads user onto req.user.
 * - optionalAuth: attaches user if token valid, but doesn't fail.
 * - apiKeyAuth: authenticates via X-Api-Key header.
 */
const jwtUtil = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const models = require('../models');

function extractToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

async function authenticate(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) throw ApiError.unauthorized('Authentication required');
    let payload;
    try {
      payload = jwtUtil.verifyAccessToken(token);
    } catch (e) {
      throw ApiError.unauthorized('Invalid or expired token');
    }
    const user = await models.User.findById(payload.id);
    if (!user) throw ApiError.unauthorized('User not found');
    if (!user.is_active) throw ApiError.forbidden('Account is deactivated');
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
}

async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (token) {
      try {
        const payload = jwtUtil.verifyAccessToken(token);
        const user = await models.User.findById(payload.id);
        if (user && user.is_active) req.user = user;
      } catch (e) {
        // ignore invalid token for optional auth
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}

async function apiKeyAuth(req, res, next) {
  try {
    const key = req.headers['x-api-key'];
    if (!key) throw ApiError.unauthorized('API key required');
    const record = await models.ApiKey.verify(key);
    if (!record) throw ApiError.unauthorized('Invalid or revoked API key');
    const user = await models.User.findById(record.user_id);
    if (!user || !user.is_active) throw ApiError.forbidden('Account is deactivated');
    req.user = user;
    req.apiKeyId = record.key_id;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  authenticate,
  optionalAuth,
  apiKeyAuth,
};
