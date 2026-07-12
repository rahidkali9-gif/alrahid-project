'use strict';

/**
 * Admin action audit log model.
 */
const db = require('../database');

const TABLE = 'admin_actions';

const AdminAction = {
  TABLE,

  async create({ adminId, action, resource = null, resourceId = null, metadata = {} }) {
    const r = await db.query(
      `INSERT INTO ${TABLE} (admin_id, action, resource, resource_id, metadata)
       VALUES ($1, $2, $3, $4, $5::jsonb) RETURNING *`,
      [adminId, action, resource, resourceId, JSON.stringify(metadata)]
    );
    return r.rows[0];
  },

  async list({ page = 1, limit = 20, adminId = null, action = null } = {}) {
    const offset = (page - 1) * limit;
    const where = [];
    const params = [];
    if (adminId) {
      params.push(adminId);
      where.push(`admin_id = $${params.length}`);
    }
    if (action) {
      params.push(action);
      where.push(`action = $${params.length}`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const countR = await db.query(`SELECT COUNT(*)::int AS total FROM ${TABLE} ${whereSql}`, params);
    const total = countR.rows[0].total;
    params.push(limit, offset);
    const r = await db.query(
      `SELECT a.*, u.email AS admin_email, u.name AS admin_name
       FROM ${TABLE} a LEFT JOIN users u ON u.id = a.admin_id
       ${whereSql}
       ORDER BY a.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return { rows: r.rows, total, page, limit };
  },
};

module.exports = AdminAction;
