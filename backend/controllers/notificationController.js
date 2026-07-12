'use strict';

/**
 * Notification controller.
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
  const onlyUnread = req.query.unread === 'true' || req.query.unread === '1';
  const result = await models.Notification.listByUser(req.user.id, { page, limit, onlyUnread });
  return ApiResponse.paginated(res, 'Notifications fetched', result.rows, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: Math.ceil(result.total / result.limit),
  });
});

exports.unreadCount = asyncHandler(async (req, res) => {
  const count = await models.Notification.unreadCount(req.user.id);
  return ApiResponse.success(res, 'Unread count', { count });
});

exports.markRead = asyncHandler(async (req, res) => {
  const n = await models.Notification.markRead(req.params.id, req.user.id);
  if (!n) throw ApiError.notFound('Notification not found');
  return ApiResponse.success(res, 'Marked as read', { notification: n });
});

exports.markAllRead = asyncHandler(async (req, res) => {
  const count = await models.Notification.markAllRead(req.user.id);
  return ApiResponse.success(res, 'All marked as read', { count });
});

exports.delete = asyncHandler(async (req, res) => {
  const ok = await models.Notification.delete(req.params.id, req.user.id);
  if (!ok) throw ApiError.notFound('Notification not found');
  return ApiResponse.success(res, 'Notification deleted');
});
