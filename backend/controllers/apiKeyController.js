'use strict';

/**
 * API key controller. Raw key is shown only on creation.
 */
const models = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

exports.create = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const key = await models.ApiKey.create({ userId: req.user.id, name });
  return ApiResponse.created(res, 'API key created (save the key now, it will not be shown again)', {
    id: key.id,
    name: key.name,
    keyPrefix: key.key_prefix,
    key: key.key,
    createdAt: key.created_at,
  });
});

exports.list = asyncHandler(async (req, res) => {
  const keys = await models.ApiKey.listByUser(req.user.id);
  return ApiResponse.success(res, 'API keys fetched', { keys });
});

exports.revoke = asyncHandler(async (req, res) => {
  const ok = await models.ApiKey.revoke(req.params.id, req.user.id);
  if (!ok) throw ApiError.notFound('API key not found');
  return ApiResponse.success(res, 'API key revoked');
});

exports.delete = asyncHandler(async (req, res) => {
  const ok = await models.ApiKey.delete(req.params.id, req.user.id);
  if (!ok) throw ApiError.notFound('API key not found');
  return ApiResponse.success(res, 'API key deleted');
});
