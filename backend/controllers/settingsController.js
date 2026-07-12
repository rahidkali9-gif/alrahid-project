'use strict';

/**
 * Settings controller — alias for user settings routes.
 */
const models = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

exports.list = asyncHandler(async (req, res) => {
  const settings = await models.Setting.listByUser(req.user.id);
  return ApiResponse.success(res, 'Settings fetched', { settings });
});

exports.get = asyncHandler(async (req, res) => {
  const setting = await models.Setting.get(req.user.id, req.params.key);
  if (!setting) throw ApiError.notFound('Setting not found');
  return ApiResponse.success(res, 'Setting fetched', { setting });
});

exports.upsert = asyncHandler(async (req, res) => {
  const { key, value } = req.body;
  if (!key) throw ApiError.badRequest('key is required');
  const setting = await models.Setting.upsert(req.user.id, key, value);
  return ApiResponse.success(res, 'Setting saved', { setting });
});

exports.bulk = asyncHandler(async (req, res) => {
  const { settings } = req.body;
  if (!Array.isArray(settings)) throw ApiError.badRequest('settings must be an array');
  const rows = await models.Setting.bulkUpsert(
    req.user.id,
    settings.map((s) => ({ key: s.key, value: s.value }))
  );
  return ApiResponse.success(res, 'Settings saved', { settings: rows });
});

exports.remove = asyncHandler(async (req, res) => {
  const ok = await models.Setting.delete(req.user.id, req.params.key);
  if (!ok) throw ApiError.notFound('Setting not found');
  return ApiResponse.success(res, 'Setting deleted');
});

// Public app settings (from DB)
exports.publicAppSettings = asyncHandler(async (req, res) => {
  const settings = await models.AppSetting.list({ publicOnly: true });
  const obj = {};
  for (const s of settings) obj[s.key] = s.value;
  return ApiResponse.success(res, 'Public app settings', { settings: obj });
});
