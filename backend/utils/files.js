'use strict';

/**
 * File-system helpers for uploads, directory safety, and path building.
 */
const fs = require('fs');
const path = require('path');
const env = require('../config/env');

const UPLOAD_DIR = env.UPLOAD_DIR || 'uploads';

/**
 * Ensure a directory exists.
 */
function ensureDir(dir) {
  fs.mkdirSync(path.resolve(dir), { recursive: true });
  return dir;
}

/**
 * Build a safe upload path under UPLOAD_DIR/category.
 */
function buildUploadPath(category = 'misc') {
  const safe = String(category).replace(/[^a-z0-9_-]/gi, '_').toLowerCase() || 'misc';
  const dir = path.join(UPLOAD_DIR, safe);
  ensureDir(dir);
  return dir;
}

/**
 * Sanitize a filename.
 */
function sanitizeFilename(name) {
  return String(name)
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 120);
}

/**
 * Generate a unique filename preserving extension.
 */
function uniqueFilename(originalName, prefix = '') {
  const ext = path.extname(originalName || '').toLowerCase();
  const base = path.basename(originalName || 'file', ext);
  const safe = sanitizeFilename(base).slice(0, 40);
  const stamp = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}${safe}_${stamp}${ext}`;
}

/**
 * Relative URL path for a stored file.
 */
function fileUrl(filePath, req) {
  const rel = path.relative(path.resolve(UPLOAD_DIR), filePath).split(path.sep).join('/');
  if (req) {
    const proto = req.protocol;
    const host = req.get('host');
    return `${proto}://${host}/${UPLOAD_DIR}/${rel}`;
  }
  return `/${UPLOAD_DIR}/${rel}`;
}

/**
 * Delete a file if it exists. Returns true if deleted.
 */
function deleteFile(filePath) {
  try {
    const full = path.resolve(filePath);
    fs.unlinkSync(full);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get file size in bytes.
 */
function fileSize(filePath) {
  try {
    return fs.statSync(path.resolve(filePath)).size;
  } catch (e) {
    return 0;
  }
}

module.exports = {
  UPLOAD_DIR,
  ensureDir,
  buildUploadPath,
  sanitizeFilename,
  uniqueFilename,
  fileUrl,
  deleteFile,
  fileSize,
};
