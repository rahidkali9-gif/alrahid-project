'use strict';

/**
 * Loads and validates environment variables. Provides typed, defaulted access.
 */
require('dotenv').config();

const toInt = (val, def) => {
  const n = parseInt(val, 10);
  return Number.isFinite(n) ? n : def;
};

const toBool = (val, def) => {
  if (val === undefined || val === null || val === '') return def;
  return String(val).toLowerCase() === 'true' || val === '1' || val === 'yes';
};

const required = (key, def) => {
  const v = process.env[key];
  if (v === undefined || v === null || v === '') {
    if (def !== undefined) return def;
    if (process.env.NODE_ENV === 'production') {
      // eslint-disable-next-line no-console
      console.warn(`[env] Missing required env var: ${key}`);
    }
    return def;
  }
  return v;
};

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: toInt(process.env.PORT, 3000),
  HOST: process.env.HOST || '0.0.0.0',
  APP_NAME: process.env.APP_NAME || 'Al Rahid',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',

  // JWT
  JWT_SECRET: required('JWT_SECRET', 'dev-jwt-secret-change-me'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET', 'dev-jwt-refresh-secret-change-me'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Bcrypt
  BCRYPT_SALT_ROUNDS: toInt(process.env.BCRYPT_SALT_ROUNDS, 10),

  // API keys
  API_KEY_PREFIX: process.env.API_KEY_PREFIX || 'arh_live_',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // Uploads
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE_MB: toInt(process.env.MAX_FILE_SIZE_MB, 25),

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_DIR: process.env.LOG_DIR || 'logs',

  // Default seed admin/demo
  DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL || 'admin@alrahid.com',
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456',
  DEFAULT_DEMO_EMAIL: process.env.DEFAULT_DEMO_EMAIL || 'demo@alrahid.com',
  DEFAULT_DEMO_PASSWORD: process.env.DEFAULT_DEMO_PASSWORD || 'Demo@123456',
};

module.exports = env;
