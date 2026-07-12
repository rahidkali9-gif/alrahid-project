'use strict';

/**
 * Activity log controller.
 */
const models = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

function parsePaging(req) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 20));
  return { page, limit };
}

exports.list = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaging(req);
  const result = await models.ActivityLog.listByUser(req.user.id, { page, limit });
  return ApiResponse.paginated(res, 'Activity logs fetched', result.rows, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: Math.ceil(result.total / result.limit),
  });
});
