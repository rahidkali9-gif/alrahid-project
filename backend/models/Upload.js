'use strict';

/**
 * Upload metadata model.
 */
const db = require('../database');

const TABLE = 'uploads';

const Upload = {
  TABLE,

  async create({ userId, filename, originalName, mimeType, sizeBytes, category, url, path, metadata = {} }) {
    const r = await db.query(
      `INSERT INTO ${TABLE} (user_id, filename, original_name, mime_type, size_bytes, category, url, path, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb) RETURNING *`,
      [userId, filename, originalName, mimeType, sizeBytes, category, url, path, JSON.stringify(metadata)]
    );
    return r.rows[0];
  },

  async findById(id) {
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE id = $1`, [id]);
    return r.rows[0] || null;
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

  async listAll({ page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const countR = await db.query(`SELECT COUNT(*)::int AS total FROM ${TABLE}`);
    const total = countR.rows[0].total;
    const r = await db.query(
      `SELECT u.*, us.email AS user_email, us.name AS user_name
       FROM ${TABLE} u LEFT JOIN users us ON us.id = u.user_id
       ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return { rows: r.rows, total, page, limit };
  },

  async delete(id) {
    const r = await db.query(`DELETE FROM ${TABLE} WHERE id = $1 RETURNING id, path, user_id`, [id]);
    return r.rows[0] || null;
  },

  async deleteByUser(id, userId) {
    const r = await db.query(`DELETE FROM ${TABLE} WHERE id = $1 AND user_id = $2 RETURNING id, path`, [id, userId]);
    return r.rows[0] || null;
  },
};

module.exports = Upload;
