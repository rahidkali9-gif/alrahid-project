'use strict';

/**
 * Global app settings model (admin-managed).
 */
const db = require('../database');

const TABLE = 'app_settings';

const AppSetting = {
  TABLE,

  async list({ category = null, publicOnly = false } = {}) {
    const where = [];
    const params = [];
    if (category) {
      params.push(category);
      where.push(`category = $${params.length}`);
    }
    if (publicOnly) {
      where.push(`is_public = TRUE`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const r = await db.query(`SELECT * FROM ${TABLE} ${whereSql} ORDER BY key ASC`, params);
    return r.rows;
  },

  async get(key) {
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE key = $1`, [key]);
    return r.rows[0] || null;
  },

  async upsert({ key, value, category = 'general', isPublic = false }) {
    const r = await db.query(
      `INSERT INTO ${TABLE} (key, value, category, is_public)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (key) DO UPDATE
         SET value = EXCLUDED.value, category = EXCLUDED.category, is_public = EXCLUDED.is_public
       RETURNING *`,
      [key, value, category, isPublic]
    );
    return r.rows[0];
  },

  async delete(key) {
    const r = await db.query(`DELETE FROM ${TABLE} WHERE key = $1 RETURNING id`, [key]);
    return r.rowCount > 0;
  },

  async asObject({ publicOnly = false } = {}) {
    const rows = await this.list({ publicOnly });
    const obj = {};
    for (const row of rows) obj[row.key] = row.value;
    return obj;
  },
};

module.exports = AppSetting;
