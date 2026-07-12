'use strict';

/**
 * AI generation record model.
 */
const db = require('../database');

const TABLE = 'ai_generations';

const AiGeneration = {
  TABLE,

  async create({ userId, type, prompt, model = null, provider = null, cost = 0 }) {
    const r = await db.query(
      `INSERT INTO ${TABLE} (user_id, type, prompt, model, provider, status, cost)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6) RETURNING *`,
      [userId, type, prompt, model, provider, cost]
    );
    return r.rows[0];
  },

  async updateStatus(id, status, { result = null, tokensUsed = null, durationMs = null, errorMessage = null, model = null } = {}) {
    const r = await db.query(
      `UPDATE ${TABLE}
       SET status = $1,
           result = COALESCE($2::jsonb, result),
           tokens_used = COALESCE($3, tokens_used),
           duration_ms = COALESCE($4, duration_ms),
           error_message = COALESCE($5, error_message),
           model = COALESCE($6, model)
       WHERE id = $7 RETURNING *`,
      [status, result ? JSON.stringify(result) : null, tokensUsed, durationMs, errorMessage, model, id]
    );
    return r.rows[0] || null;
  },

  async findById(id) {
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE id = $1`, [id]);
    return r.rows[0] || null;
  },

  async listByUser(userId, { page = 1, limit = 20, type = null } = {}) {
    const offset = (page - 1) * limit;
    const where = ['user_id = $1'];
    const params = [userId];
    if (type) {
      params.push(type);
      where.push(`type = $${params.length}`);
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

  async count() {
    const r = await db.query(`SELECT COUNT(*)::int AS total FROM ${TABLE}`);
    return r.rows[0].total;
  },

  async usageByType() {
    const r = await db.query(
      `SELECT type, COUNT(*)::int AS count, COALESCE(SUM(cost),0)::int AS total_cost
       FROM ${TABLE} GROUP BY type ORDER BY count DESC`
    );
    return r.rows;
  },
};

module.exports = AiGeneration;
