'use strict';

/**
 * Activity log model.
 */
const db = require('../database');

const TABLE = 'activity_logs';

const ActivityLog = {
  TABLE,

  async create({ userId = null, category, action, method = null, path = null, statusCode = null, ipAddress = null, userAgent = null, metadata = {}, durationMs = null }) {
    const r = await db.query(
      `INSERT INTO ${TABLE} (user_id, category, action, method, path, status_code, ip_address, user_agent, metadata, duration_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10) RETURNING *`,
      [userId, category, action, method, path, statusCode, ipAddress, userAgent, JSON.stringify(metadata), durationMs]
    );
    return r.rows[0];
  },

  async listByUser(userId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const countR = await db.query(`SELECT COUNT(*)::int AS total FROM ${TABLE} WHERE user_id = $1`, [userId]);
    const total = countR.rows[0].total;
    const r = await db.query(
      `SELECT * FROM ${TABLE} WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return { rows: r.rows, total, page, limit };
  },

  async listAll({ page = 1, limit = 20, userId = null, category = null } = {}) {
    const offset = (page - 1) * limit;
    const where = [];
    const params = [];
    if (userId) {
      params.push(userId);
      where.push(`user_id = $${params.length}`);
    }
    if (category) {
      params.push(category);
      where.push(`category = $${params.length}`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const countR = await db.query(`SELECT COUNT(*)::int AS total FROM ${TABLE} ${whereSql}`, params);
    const total = countR.rows[0].total;
    params.push(limit, offset);
    const r = await db.query(
      `SELECT * FROM ${TABLE} ${whereSql} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return { rows: r.rows, total, page, limit };
  },
};

module.exports = ActivityLog;
