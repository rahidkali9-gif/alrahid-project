'use strict';

/**
 * Per-user settings (key/value) model.
 */
const db = require('../database');

const TABLE = 'settings';

const Setting = {
  TABLE,

  async listByUser(userId) {
    const r = await db.query(`SELECT id, key, value, created_at, updated_at FROM ${TABLE} WHERE user_id = $1 ORDER BY key ASC`, [userId]);
    return r.rows;
  },

  async get(userId, key) {
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE user_id = $1 AND key = $2`, [userId, key]);
    return r.rows[0] || null;
  },

  async upsert(userId, key, value) {
    const r = await db.query(
      `INSERT INTO ${TABLE} (user_id, key, value)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value
       RETURNING *`,
      [userId, key, value]
    );
    return r.rows[0];
  },

  async delete(userId, key) {
    const r = await db.query(`DELETE FROM ${TABLE} WHERE user_id = $1 AND key = $2 RETURNING id`, [userId, key]);
    return r.rowCount > 0;
  },

  async bulkUpsert(userId, entries) {
    const inserted = [];
    for (const { key, value } of entries) {
      const row = await this.upsert(userId, key, value);
      inserted.push(row);
    }
    return inserted;
  },
};

module.exports = Setting;
