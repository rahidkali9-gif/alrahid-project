'use strict';

/**
 * Multer upload middleware with MIME validation and category subdirs.
 */
const path = require('path');
const multer = require('multer');
const env = require('../config/env');
const files = require('../utils/files');
const ApiError = require('../utils/ApiError');

const MAX_BYTES = (env.MAX_FILE_SIZE_MB || 25) * 1024 * 1024;

const ALLOWED = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml'],
  video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/mp4', 'audio/flac'],
  pdf: ['application/pdf'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/rtf',
    'application/json',
    'application/zip',
  ],
};

const MIME_TO_CATEGORY = {};
for (const [cat, mimes] of Object.entries(ALLOWED)) {
  for (const m of mimes) {
    if (!MIME_TO_CATEGORY[m]) MIME_TO_CATEGORY[m] = cat;
  }
}

function categoryFromMime(mime) {
  return MIME_TO_CATEGORY[mime] || 'misc';
}

function categoryFromField(field) {
  const map = { image: 'image', video: 'video', audio: 'audio', pdf: 'pdf', document: 'document' };
  return map[field] || 'misc';
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const cat = categoryFromMime(file.mimetype) || categoryFromField(file.fieldname);
    const dir = files.buildUploadPath(cat);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, files.uniqueFilename(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allAllowed = Object.values(ALLOWED).flat();
  if (!allAllowed.includes(file.mimetype)) {
    return cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter,
});

/**
 * Build a dynamic array of allowed MIME types for a given field category.
 */
function allowedForCategory(cat) {
  return ALLOWED[cat] || Object.values(ALLOWED).flat();
}

module.exports = {
  upload,
  ALLOWED,
  MAX_BYTES,
  categoryFromMime,
  categoryFromField,
  allowedForCategory,
};
