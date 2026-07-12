'use strict';

/**
 * Auth service — registration, login, token rotation, password flows.
 */
const bcrypt = require('bcrypt');
const models = require('../models');
const db = require('../database');
const jwtUtil = require('../utils/jwt');
const cryptoUtil = require('../utils/crypto');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const security = require('../config/security');
const logger = require('../utils/logger');

async function register({ name, email, password }) {
  const existing = await models.User.findByEmail(email);
  if (existing) throw ApiError.conflict('Email already registered');
  const user = await models.User.create({ name, email, password, role: 'user' });
  await models.Profile.upsert(user.id, { first_name: name });
  await models.Wallet.ensure(user.id);
  await models.Notification.create({
    userId: user.id,
    title: 'Welcome to Al Rahid',
    message: 'Your account has been created successfully.',
    type: 'success',
  });
  const tokens = await issueTokens(user);
  return { user, ...tokens };
}

async function login({ email, password }) {
  const user = await models.User.findByEmail(email, { includeSensitive: true });
  if (!user) throw ApiError.unauthorized('Invalid credentials');
  if (!user.is_active) throw ApiError.forbidden('Account is deactivated');
  const ok = await models.User.verifyPassword(password, user.password_hash);
  if (!ok) throw ApiError.unauthorized('Invalid credentials');
  await models.User.update(user.id, { last_login_at: new Date() });
  const tokens = await issueTokens(user);
  return { user: sanitize(user), ...tokens };
}

async function refresh(token) {
  if (!token) throw ApiError.unauthorized('Refresh token required');
  let payload;
  try {
    payload = jwtUtil.verifyRefreshToken(token);
  } catch (e) {
    throw ApiError.unauthorized('Invalid refresh token');
  }
  const stored = await models.User.findByRefreshToken(token);
  if (!stored) throw ApiError.unauthorized('Refresh token not recognized');
  if (!stored.is_active) throw ApiError.forbidden('Account is deactivated');
  // rotate
  await models.User.clearRefreshToken(stored.id);
  const tokens = await issueTokens(stored);
  return { user: stored, ...tokens };
}

async function logout(userId) {
  await models.User.clearRefreshToken(userId);
  return true;
}

async function forgotPassword(email) {
  const user = await models.User.findByEmail(email, { includeSensitive: true });
  // always return success to avoid email enumeration
  if (!user) return { sent: false };
  const token = cryptoUtil.randomToken(32);
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h
  await models.User.setResetToken(user.id, token, expires);
  logger.info('Password reset requested', { email, token });
  return { sent: true, resetToken: token, resetUrl: `${env.APP_URL}/reset-password?token=${token}` };
}

async function resetPassword(token, newPassword) {
  const user = await models.User.findByResetToken(token);
  if (!user) throw ApiError.badRequest('Invalid or expired reset token');
  await models.User.updatePassword(user.id, newPassword);
  await models.User.clearResetToken(user.id);
  await models.User.clearRefreshToken(user.id);
  await models.PasswordChange.create({ userId: user.id, reason: 'forgot_reset' });
  return true;
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await models.User.findById(userId, { includeSensitive: true });
  if (!user) throw ApiError.notFound('User not found');
  const ok = await models.User.verifyPassword(currentPassword, user.password_hash);
  if (!ok) throw ApiError.unauthorized('Current password is incorrect');
  await models.User.updatePassword(user.id, newPassword);
  await models.User.clearRefreshToken(user.id);
  await models.PasswordChange.create({ userId, reason: 'user_change' });
  return true;
}

async function issueTokens(user) {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwtUtil.signAccessToken(payload);
  const refreshToken = jwtUtil.signRefreshToken(payload);
  await models.User.setRefreshToken(user.id, refreshToken);
  return { accessToken, refreshToken };
}

function sanitize(user) {
  if (!user) return null;
  const { password_hash, refresh_token, reset_token, reset_token_expires_at, ...rest } = user;
  return rest;
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  issueTokens,
  sanitize,
};
