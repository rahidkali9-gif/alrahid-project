'use strict';

/**
 * JWT helpers — sign/verify access and refresh tokens.
 */
const jwt = require('jsonwebtoken');
const security = require('../config/security');

/**
 * Sign an access token for a user payload.
 * @param {{ id: string|number, email: string, role: string }} payload
 * @returns {string}
 */
function signAccessToken(payload) {
  return jwt.sign(payload, security.jwt.secret, {
    expiresIn: security.jwt.expiresIn,
  });
}

/**
 * Sign a refresh token.
 */
function signRefreshToken(payload) {
  return jwt.sign(payload, security.jwt.refreshSecret, {
    expiresIn: security.jwt.refreshExpiresIn,
  });
}

/**
 * Verify an access token. Throws on invalid.
 */
function verifyAccessToken(token) {
  return jwt.verify(token, security.jwt.secret);
}

/**
 * Verify a refresh token. Throws on invalid.
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, security.jwt.refreshSecret);
}

/**
 * Decode without verification (for inspecting expired tokens).
 */
function decode(token) {
  return jwt.decode(token);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decode,
};
