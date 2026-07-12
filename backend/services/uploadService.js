'use strict';

/**
 * Upload service — persists upload metadata and returns URLs.
 */
const path = require('path');
const fs = require('fs');
const models = require('../models');
const files = require('../utils/files');
const ApiError = require('../utils/ApiError');

async function recordUpload(req, file, category = null) {
  const cat = category || files.categoryFromMime ? files.categoryFromMime(file.mimetype) : 'misc';
  const full = path.resolve(file.path);
  const url = files.fileUrl(full, req);
  const record = await models.Upload.create({
    userId: req.user.id,
    filename: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    category: cat,
    url,
    path: full,
    metadata: { encoding: file.encoding },
  });
  return record;
}

async function listUserUploads(userId, { page = 1, limit = 20, category = null } = {}) {
  return models.Upload.listByUser(userId, { page, limit, category });
}

async function deleteUpload(id, userId, { admin = false } = {}) {
  const row = admin ? await models.Upload.delete(id) : await models.Upload.deleteByUser(id, userId);
  if (!row) throw ApiError.notFound('Upload not found');
  files.deleteFile(row.path);
  return true;
}

async function listAllUploads({ page = 1, limit = 20 } = {}) {
  return models.Upload.listAll({ page, limit });
}

module.exports = {
  recordUpload,
  listUserUploads,
  deleteUpload,
  listAllUploads,
};
