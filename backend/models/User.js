'use strict';

/**
 * User model. Wraps user queries and password hashing.
 */
const bcrypt = require('bcrypt');
const db = require('../database');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const TABLE = 'users';

const User = {
  TABLE,

  async findById(id, { includeSensitive = false } = {}) {
    const cols = includeSensitive
      ? 'id, name, email, password_hash, role, is_active, last_login_at, avatar_url, created_at, updated_at'
      : 'id, name, email, role, is_active, last_login_at, avatar_url, created_at, updated_at';
    const r = await db.query(`SELECT ${cols} FROM ${TABLE} WHERE id = $1`, [id]);
    return r.rows[0] || null;
  },

  async findByEmail(email, { includeSensitive = false } = {}) {
    const cols = includeSensitive
      ? 'id, name, email, password_hash, role, is_active, last_login_at, avatar_url, refresh_token, reset_token, reset_token_expires_at, created_at, updated_at'
      : 'id, name, email, role, is_active, last_login_at, avatar_url, created_at, updated_at';
    const r = await db.query(`SELECT ${cols} FROM ${TABLE} WHERE email = $1`, [email]);
    return r.rows[0] || null;
  },

  async list({ page = 1, limit = 20, search = '', role = '', isActive = null } = {}) {
    const offset = (page - 1) * limit;
    const where = [];
    const params = [];
    let idx = 1;
    if (search) {
      where.push(`(name ILIKE $${idx} OR email ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (role) {
      where.push(`role = $${idx}`);
      params.push(role);
      idx++;
    }
    if (isActive !== null && isActive !== undefined) {
      where.push(`is_active = $${idx}`);
      params.push(isActive);
      idx++;
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const countR = await db.query(`SELECT COUNT(*)::int AS total FROM ${TABLE} ${whereSql}`, params);
    const total = countR.rows[0].total;
    const r = await db.query(
      `SELECT id, name, email, role, is_active, last_login_at, avatar_url, created_at, updated_at
       FROM ${TABLE} ${whereSql}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    );
    return { rows: r.rows, total, page, limit };
  },

  async create({ name, email, password, role = 'user' }) {
    const hash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
    const r = await db.query(
      `INSERT INTO ${TABLE} (name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING id, name, email, role, is_active, created_at, updated_at`,
      [name, email, hash, role]
    );
    return r.rows[0];
  },

  async update(id, fields) {
    const allowed = ['name', 'avatar_url', 'role', 'is_active', 'last_login_at', 'refresh_token', 'reset_token', 'reset_token_expires_at'];
    const sets = [];
    const params = [];
    let idx = 1;
    for (const k of allowed) {
      if (fields[k] !== undefined) {
        sets.push(`${k} = $${idx}`);
        params.push(fields[k]);
        idx++;
      }
    }
    if (!sets.length) return this.findById(id);
    params.push(id);
    const r = await db.query(
      `UPDATE ${TABLE} SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id, name, email, role, is_active, last_login_at, avatar_url, created_at, updated_at`,
      params
    );
    return r.rows[0] || null;
  },

  async updatePassword(id, newPassword) {
    const hash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);
    await db.query(`UPDATE ${TABLE} SET password_hash = $1 WHERE id = $2`, [hash, id]);
    return true;
  },

  async verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  },

  async delete(id) {
    await db.query(`DELETE FROM ${TABLE} WHERE id = $1`, [id]);
    return true;
  },

  async setRefreshToken(id, token) {
    await db.query(`UPDATE ${TABLE} SET refresh_token = $1 WHERE id = $2`, [token, id]);
  },

  async clearRefreshToken(id) {
    await db.query(`UPDATE ${TABLE} SET refresh_token = NULL WHERE id = $1`, [id]);
  },

  async findByRefreshToken(token) {
    if (!token) return null;
    const r = await db.query(`SELECT id, name, email, role, is_active FROM ${TABLE} WHERE refresh_token = $1`, [token]);
    return r.rows[0] || null;
  },

  async setResetToken(id, token, expiresAt) {
    await db.query(`UPDATE ${TABLE} SET reset_token = $1, reset_token_expires_at = $2 WHERE id = $3`, [token, expiresAt, id]);
  },

  async findByResetToken(token) {
    if (!token) return null;
    const r = await db.query(
      `SELECT id, name, email, role, is_active FROM ${TABLE}
       WHERE reset_token = $1 AND reset_token_expires_at > NOW()`,
      [token]
    );
    return r.rows[0] || null;
  },

  async clearResetToken(id) {
    await db.query(`UPDATE ${TABLE} SET reset_token = NULL, reset_token_expires_at = NULL WHERE id = $1`, [id]);
  },

  async count() {
    const r = await db.query(`SELECT COUNT(*)::int AS total FROM ${TABLE}`);
    return r.rows[0].total;
  },

  async countByRole(role) {
    const r = await db.query(`SELECT COUNT(*)::int AS total FROM ${TABLE} WHERE role = $1`, [role]);
    return r.rows[0].total;
  },

  async recentRegistrations(days = 30) {
    const r = await db.query(
      `SELECT DATE(created_at) AS day, COUNT(*)::int AS count
       FROM ${TABLE}
       WHERE created_at >= NOW() - ($1 || ' days')::interval
       GROUP BY day ORDER BY day ASC`,
      [String(days)]
    );
    return r.rows;
  },
};

module.exports = User;
