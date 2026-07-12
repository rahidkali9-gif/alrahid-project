'use strict';

/**
 * API key model. Keys are stored as SHA-256 hashes; raw key shown once.
 */
const db = require('../database');
const cryptoUtil = require('../utils/crypto');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const TABLE = 'api_keys';

const ApiKey = {
  TABLE,

  /**
   * Create a new API key. Returns the raw key (only time it's visible).
   */
  async create({ userId, name = null }) {
    const { raw, prefix, hash } = cryptoUtil.generateApiKey(env.API_KEY_PREFIX);
    const r = await db.query(
      `INSERT INTO ${TABLE} (user_id, name, key_hash, key_prefix)
       VALUES ($1, $2, $3, $4) RETURNING id, user_id, name, key_prefix, created_at`,
      [userId, name, hash, prefix]
    );
    return { ...r.rows[0], key: raw };
  },

  async listByUser(userId) {
    const r = await db.query(
      `SELECT id, user_id, name, key_prefix, last_used_at, is_revoked, expires_at, created_at
       FROM ${TABLE} WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return r.rows;
  },

  async listAll({ page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const countR = await db.query(`SELECT COUNT(*)::int AS total FROM ${TABLE}`);
    const total = countR.rows[0].total;
    const r = await db.query(
      `SELECT k.id, k.user_id, k.name, k.key_prefix, k.last_used_at, k.is_revoked, k.expires_at, k.created_at,
              u.email AS user_email, u.name AS user_name
       FROM ${TABLE} k LEFT JOIN users u ON u.id = k.user_id
       ORDER BY k.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return { rows: r.rows, total, page, limit };
  },

  async revoke(id, userId) {
    const r = await db.query(
      `UPDATE ${TABLE} SET is_revoked = TRUE WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    return r.rowCount > 0;
  },

  async delete(id, userId) {
    const r = await db.query(`DELETE FROM ${TABLE} WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
    return r.rowCount > 0;
  },

  /**
   * Verify a raw API key. Returns the key row + user if valid.
   */
  async verify(rawKey) {
    if (!rawKey) return null;
    const hash = cryptoUtil.sha256(rawKey);
    const r = await db.query(
      `SELECT k.id AS key_id, k.user_id, k.is_revoked, k.expires_at,
              u.name, u.email, u.role, u.is_active
       FROM ${TABLE} k
       JOIN users u ON u.id = k.user_id
       WHERE k.key_hash = $1`,
      [hash]
    );
    const row = r.rows[0];
    if (!row) return null;
    if (row.is_revoked) return null;
    if (row.expires_at && new Date(row.expires_at) < new Date()) return null;
    if (!row.is_active) return null;
    // update last_used_at
    await db.query(`UPDATE ${TABLE} SET last_used_at = NOW() WHERE id = $1`, [row.key_id]);
    return row;
  },
};

module.exports = ApiKey;
