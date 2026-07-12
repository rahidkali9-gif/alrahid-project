'use strict';

/**
 * Notification model.
 */
const db = require('../database');

const TABLE = 'notifications';

const Notification = {
  TABLE,

  async listByUser(userId, { page = 1, limit = 20, onlyUnread = false } = {}) {
    const offset = (page - 1) * limit;
    const where = ['user_id = $1'];
    const params = [userId];
    if (onlyUnread) where.push('is_read = FALSE');
    const countR = await db.query(`SELECT COUNT(*)::int AS total FROM ${TABLE} WHERE ${where.join(' AND ')}`, params);
    const total = countR.rows[0].total;
    const r = await db.query(
      `SELECT * FROM ${TABLE} WHERE ${where.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    return { rows: r.rows, total, page, limit };
  },

  async unreadCount(userId) {
    const r = await db.query(`SELECT COUNT(*)::int AS total FROM ${TABLE} WHERE user_id = $1 AND is_read = FALSE`, [userId]);
    return r.rows[0].total;
  },

  async create({ userId, title, message, type = 'info', link = null, metadata = {} }) {
    const r = await db.query(
      `INSERT INTO ${TABLE} (user_id, title, message, type, link, metadata)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb) RETURNING *`,
      [userId, title, message, type, link, JSON.stringify(metadata)]
    );
    return r.rows[0];
  },

  async createMany(userIds, payload) {
    let created = 0;
    for (const userId of userIds) {
      await this.create({ userId, ...payload });
      created++;
    }
    return created;
  },

  async markRead(id, userId) {
    const r = await db.query(
      `UPDATE ${TABLE} SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    return r.rows[0] || null;
  },

  async markAllRead(userId) {
    const r = await db.query(`UPDATE ${TABLE} SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`, [userId]);
    return r.rowCount;
  },

  async delete(id, userId) {
    const r = await db.query(`DELETE FROM ${TABLE} WHERE id = $1 AND user_id = $2 RETURNING id`, [id, userId]);
    return r.rowCount > 0;
  },
};

module.exports = Notification;
