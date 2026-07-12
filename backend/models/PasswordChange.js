'use strict';

/**
 * Password change audit model.
 */
const db = require('../database');

const TABLE = 'password_changes';

const PasswordChange = {
  TABLE,

  async create({ userId, changedBy = null, ipAddress = null, userAgent = null, reason = 'user_change' }) {
    const r = await db.query(
      `INSERT INTO ${TABLE} (user_id, changed_by, ip_address, user_agent, reason)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, changedBy, ipAddress, userAgent, reason]
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
};

module.exports = PasswordChange;
