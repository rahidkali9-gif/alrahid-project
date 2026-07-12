'use strict';

/**
 * User-facing history model.
 */
const db = require('../database');

const TABLE = 'history';

const History = {
  TABLE,

  async create({ userId, category, action, title = null, summary = null, metadata = {} }) {
    const r = await db.query(
      `INSERT INTO ${TABLE} (user_id, category, action, title, summary, metadata)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb) RETURNING *`,
      [userId, category, action, title, summary, JSON.stringify(metadata)]
    );
    return r.rows[0];
  },

  async listByUser(userId, { page = 1, limit = 20, category = null } = {}) {
    const offset = (page - 1) * limit;
    const where = ['user_id = $1'];
    const params = [userId];
    if (category) {
      params.push(category);
      where.push(`category = $${params.length}`);
    }
    const countR = await db.query(`SELECT COUNT(*)::int AS total FROM ${TABLE} WHERE ${where.join(' AND ')}`, params);
    const total = countR.rows[0].total;
    params.push(limit, offset);
    const r = await db.query(
      `SELECT * FROM ${TABLE} WHERE ${where.join(' AND ')}
       ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return { rows: r.rows, total, page, limit };
  },

  async delete(id, userId) {
    const r = await db.query(`DELETE FROM ${TABLE} WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
    return r.rowCount > 0;
  },

  async clearAll(userId) {
    const r = await db.query(`DELETE FROM ${TABLE} WHERE user_id = $1 RETURNING id`, [userId]);
    return r.rowCount;
  },
};

module.exports = History;
