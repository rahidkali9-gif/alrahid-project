'use strict';

/**
 * History controller.
 */
const models = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

function parsePaging(req) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 20));
  return { page, limit };
}

exports.list = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaging(req);
  const result = await models.History.listByUser(req.user.id, {
    page,
    limit,
    category: req.query.category || null,
  });
  return ApiResponse.paginated(res, 'History fetched', result.rows, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: Math.ceil(result.total / result.limit),
  });
});

exports.delete = asyncHandler(async (req, res) => {
  const ok = await models.History.delete(req.params.id, req.user.id);
  if (!ok) throw ApiError.notFound('History item not found');
  return ApiResponse.success(res, 'History item deleted');
});

exports.clearAll = asyncHandler(async (req, res) => {
  const count = await models.History.clearAll(req.user.id);
  return ApiResponse.success(res, 'History cleared', { count });
});
