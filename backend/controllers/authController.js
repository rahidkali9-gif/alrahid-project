'use strict';

/**
 * Auth controller.
 */
const authService = require('../services/authService');
const emailService = require('../services/emailService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const security = require('../config/security');

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, security.cookie);
}
function clearRefreshCookie(res) {
  res.clearCookie('refreshToken', { ...security.cookie, maxAge: undefined });
}

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.register({ name, email, password });
  setRefreshCookie(res, result.refreshToken);
  return ApiResponse.created(res, 'Registration successful', {
    user: result.user,
    accessToken: result.accessToken,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  setRefreshCookie(res, result.refreshToken);
  return ApiResponse.success(res, 'Login successful', {
    user: result.user,
    accessToken: result.accessToken,
  });
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  clearRefreshCookie(res);
  return ApiResponse.success(res, 'Logout successful');
});

exports.refresh = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies.refreshToken || null;
  const result = await authService.refresh(token);
  setRefreshCookie(res, result.refreshToken);
  return ApiResponse.success(res, 'Token refreshed', {
    user: result.user,
    accessToken: result.accessToken,
  });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  if (result.sent && result.resetUrl) {
    await emailService.sendPasswordReset(email, result.resetUrl).catch(() => {});
  }
  return ApiResponse.success(res, 'If the email exists, a reset link has been sent');
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  return ApiResponse.success(res, 'Password reset successful');
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, password } = req.body;
  await authService.changePassword(req.user.id, currentPassword, password);
  return ApiResponse.success(res, 'Password changed successfully');
});

exports.me = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, 'Current user', { user: req.user });
});
