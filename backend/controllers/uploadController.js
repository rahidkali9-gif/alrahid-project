'use strict';

/**
 * Upload controller.
 */
const uploadService = require('../services/uploadService');
const models = require('../models');
const { upload } = require('../middleware/upload');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const single = (field = 'file') => upload.single(field);

exports.uploadFile = [
  single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No file uploaded');
    const record = await uploadService.recordUpload(req, req.file);
    return ApiResponse.created(res, 'File uploaded', { upload: record });
  }),
];

exports.list = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const result = await uploadService.listUserUploads(req.user.id, {
    page,
    limit,
    category: req.query.category || null,
  });
  return ApiResponse.paginated(res, 'Uploads fetched', result.rows, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: Math.ceil(result.total / result.limit),
  });
});

exports.delete = asyncHandler(async (req, res) => {
  await uploadService.deleteUpload(req.params.id, req.user.id);
  return ApiResponse.success(res, 'Upload deleted');
});
