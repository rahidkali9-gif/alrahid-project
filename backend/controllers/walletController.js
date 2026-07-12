'use strict';

/**
 * Wallet controller.
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

exports.getBalance = asyncHandler(async (req, res) => {
  const wallet = await models.Wallet.getBalance(req.user.id);
  return ApiResponse.success(res, 'Wallet balance', { wallet });
});

exports.transactions = asyncHandler(async (req, res) => {
  const { page, limit } = parsePaging(req);
  const result = await models.Wallet.listTransactions(req.user.id, {
    page,
    limit,
    type: req.query.type || null,
  });
  return ApiResponse.paginated(res, 'Transactions fetched', result.rows, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: Math.ceil(result.total / result.limit),
  });
});
