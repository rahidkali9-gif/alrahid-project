'use strict';

/**
 * PostgreSQL pool wrapper with query(), transaction(), ping(), close().
 * Logs slow queries via Winston.
 */
const { Pool } = require('pg');
const dbConfig = require('../config/db');
const logger = require('../utils/logger');

const SLOW_QUERY_MS = 500;

const pool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  password: dbConfig.password,
  ssl: dbConfig.ssl,
  min: dbConfig.pool.min,
  max: dbConfig.pool.max,
  idleTimeoutMillis: dbConfig.pool.idleTimeoutMillis,
  connectionTimeoutMillis: dbConfig.pool.connectionTimeoutMillis,
});

pool.on('error', (err) => {
  logger.error('PG pool error', { error: err.message, stack: err.stack });
});

/**
 * Run a query. Last arg may be an array of params.
 * Logs slow queries.
 */
async function query(text, params = []) {
  const start = Date.now();
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    if (duration > SLOW_QUERY_MS) {
      logger.warn('Slow query', { text, durationMs: duration, rowCount: result.rowCount });
    } else {
      logger.debug('Query', { text, durationMs: duration, rowCount: result.rowCount });
    }
    return result;
  } catch (err) {
    const duration = Date.now() - start;
    logger.error('Query error', { text, durationMs: duration, error: err.message });
    throw err;
  } finally {
    if (client) client.release();
  }
}

/**
 * Run a transaction. cb receives a client with query() helper.
 * Commits on success, rolls back on error.
 */
async function transaction(cb) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const txQuery = (text, params = []) => client.query(text, params);
    const result = await cb({ query: txQuery, client });
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rbErr) {
      logger.error('Rollback error', { error: rbErr.message });
    }
    logger.error('Transaction error', { error: err.message });
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Test connectivity.
 */
async function ping() {
  const r = await pool.query('SELECT 1 AS ok');
  return r.rows && r.rows[0] && r.rows[0].ok === 1;
}

/**
 * Close the pool.
 */
async function close() {
  await pool.end();
  logger.info('PG pool closed');
}

module.exports = {
  pool,
  query,
  transaction,
  ping,
  close,
};
