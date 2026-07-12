'use strict';

/**
 * PostgreSQL connection pool configuration.
 */
const env = require('./env');

const toInt = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};

const toBool = (v, d) => {
  if (v === undefined || v === null || v === '') return d;
  return String(v).toLowerCase() === 'true' || v === '1';
};

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: toInt(process.env.DB_PORT, 5432),
  database: process.env.DB_NAME || 'alrahid',
  user: process.env.DB_USER || 'alrahid',
  password: process.env.DB_PASSWORD || 'alrahid_secret',
  ssl: toBool(process.env.DB_SSL, false) ? { rejectUnauthorized: false } : false,
  pool: {
    min: toInt(process.env.DB_POOL_MIN, 2),
    max: toInt(process.env.DB_POOL_MAX, 10),
    idleTimeoutMillis: toInt(process.env.DB_POOL_IDLE_TIMEOUT, 30000),
    connectionTimeoutMillis: toInt(process.env.DB_POOL_CONNECTION_TIMEOUT, 5000),
  },
};

module.exports = config;
