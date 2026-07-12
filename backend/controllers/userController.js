'use strict';

/**
 * User controller — profile, settings, and aggregated self data.
 */
const models = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await models.Profile.findByUserId(req.user.id);
  const user = req.user;
  return ApiResponse.success(res, 'Profile fetched', { user, profile });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const allowed = [
    'first_name', 'last_name', 'phone', 'bio', 'address', 'city', 'country',
    'website', 'birth_date', 'gender', 'job_title', 'company', 'preferences', 'metadata',
  ];
  const fields = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) fields[k] = req.body[k];
  }
  const profile = await models.Profile.upsert(req.user.id, fields);
  return ApiResponse.success(res, 'Profile updated', { profile });
});

exports.updateBasicInfo = asyncHandler(async (req, res) => {
  const { name, avatar_url } = req.body;
  const fields = {};
  if (name !== undefined) fields.name = name;
  if (avatar_url !== undefined) fields.avatar_url = avatar_url;
  const user = await models.User.update(req.user.id, fields);
  return ApiResponse.success(res, 'User updated', { user });
});

exports.getSettings = asyncHandler(async (req, res) => {
  const settings = await models.Setting.listByUser(req.user.id);
  return ApiResponse.success(res, 'Settings fetched', { settings });
});

exports.getSetting = asyncHandler(async (req, res) => {
  const setting = await models.Setting.get(req.user.id, req.params.key);
  if (!setting) throw ApiError.notFound('Setting not found');
  return ApiResponse.success(res, 'Setting fetched', { setting });
});

exports.upsertSetting = asyncHandler(async (req, res) => {
  const { key, value } = req.body;
  if (!key) throw ApiError.badRequest('key is required');
  const setting = await models.Setting.upsert(req.user.id, key, value);
  return ApiResponse.success(res, 'Setting saved', { setting });
});

exports.bulkUpsertSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;
  if (!Array.isArray(settings)) throw ApiError.badRequest('settings must be an array');
  const rows = await models.Setting.bulkUpsert(
    req.user.id,
    settings.map((s) => ({ key: s.key, value: s.value }))
  );
  return ApiResponse.success(res, 'Settings saved', { settings: rows });
});

exports.deleteSetting = asyncHandler(async (req, res) => {
  const ok = await models.Setting.delete(req.user.id, req.params.key);
  if (!ok) throw ApiError.notFound('Setting not found');
  return ApiResponse.success(res, 'Setting deleted');
});

exports.getOverview = asyncHandler(async (req, res) => {
  const wallet = await models.Wallet.getBalance(req.user.id);
  const unread = await models.Notification.unreadCount(req.user.id);
  return ApiResponse.success(res, 'User overview', {
    user: req.user,
    wallet,
    unreadNotifications: unread,
  });
});
