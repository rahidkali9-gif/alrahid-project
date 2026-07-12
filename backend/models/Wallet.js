'use strict';

/**
 * Wallet model. Provides balance access and atomic credit/debit via
 * a transaction + row lock. All amounts are integers (credits).
 */
const db = require('../database');
const ApiError = require('../utils/ApiError');

const TABLE = 'wallets';
const TX_TABLE = 'wallet_transactions';

const Wallet = {
  TABLE,
  TX_TABLE,

  async findByUserId(userId, { txClient = null } = {}) {
    const q = txClient
      ? (text, params) => txClient.query(text, params)
      : db.query;
    const r = await q(`SELECT * FROM ${TABLE} WHERE user_id = $1`, [userId]);
    return r.rows[0] || null;
  },

  async ensure(userId) {
    const r = await db.query(
      `INSERT INTO ${TABLE} (user_id, balance, currency)
       VALUES ($1, 0, 'credits')
       ON CONFLICT (user_id) DO NOTHING
       RETURNING *`,
      [userId]
    );
    if (r.rows[0]) return r.rows[0];
    return this.findByUserId(userId);
  },

  async getBalance(userId) {
    const w = await this.ensure(userId);
    return { balance: Number(w.balance), currency: w.currency };
  },

  /**
   * Atomically debit credits. Throws if insufficient.
   * @param {string} userId
   * @param {number} amount positive integer
   * @param {object} meta { reason, referenceType, referenceId, extraMeta }
   */
  async debit(userId, amount, { reason = 'charge', referenceType = null, referenceId = null, extraMeta = {} } = {}) {
    if (amount <= 0) throw ApiError.badRequest('Amount must be positive');
    return db.transaction(async ({ query }) => {
      const wRes = await query(`SELECT * FROM ${TABLE} WHERE user_id = $1 FOR UPDATE`, [userId]);
      if (!wRes.rows[0]) {
        // create empty wallet inside tx
        const ins = await query(
          `INSERT INTO ${TABLE} (user_id, balance, currency) VALUES ($1, 0, 'credits') ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id RETURNING *`,
          [userId]
        );
        wRes.rows[0] = ins.rows[0];
      }
      const wallet = wRes.rows[0];
      const balance = Number(wallet.balance);
      if (balance < amount) {
        throw ApiError.badRequest('Insufficient credits', { balance, required: amount });
      }
      const newBalance = balance - amount;
      await query(`UPDATE ${TABLE} SET balance = $1, version = version + 1 WHERE id = $2`, [newBalance, wallet.id]);
      await query(
        `INSERT INTO ${TX_TABLE} (wallet_id, user_id, type, amount, balance_before, balance_after, reason, reference_type, reference_id, metadata)
         VALUES ($1, $2, 'debit', $3, $4, $5, $6, $7, $8, $9::jsonb)`,
        [wallet.id, userId, amount, balance, newBalance, reason, referenceType, referenceId, JSON.stringify(extraMeta)]
      );
      return { balance: newBalance, walletId: wallet.id };
    });
  },

  /**
   * Atomically credit credits (admin grant or refund).
   */
  async credit(userId, amount, { reason = 'grant', referenceType = null, referenceId = null, extraMeta = {} } = {}) {
    if (amount <= 0) throw ApiError.badRequest('Amount must be positive');
    return db.transaction(async ({ query }) => {
      const wRes = await query(`SELECT * FROM ${TABLE} WHERE user_id = $1 FOR UPDATE`, [userId]);
      let wallet = wRes.rows[0];
      if (!wallet) {
        const ins = await query(
          `INSERT INTO ${TABLE} (user_id, balance, currency) VALUES ($1, 0, 'credits') RETURNING *`,
          [userId]
        );
        wallet = ins.rows[0];
      }
      const balance = Number(wallet.balance);
      const newBalance = balance + amount;
      await query(`UPDATE ${TABLE} SET balance = $1, version = version + 1 WHERE id = $2`, [newBalance, wallet.id]);
      await query(
        `INSERT INTO ${TX_TABLE} (wallet_id, user_id, type, amount, balance_before, balance_after, reason, reference_type, reference_id, metadata)
         VALUES ($1, $2, 'credit', $3, $4, $5, $6, $7, $8, $9::jsonb)`,
        [wallet.id, userId, amount, balance, newBalance, reason, referenceType, referenceId, JSON.stringify(extraMeta)]
      );
      return { balance: newBalance, walletId: wallet.id };
    });
  },

  async listTransactions(userId, { page = 1, limit = 20, type = null } = {}) {
    const offset = (page - 1) * limit;
    const where = ['user_id = $1'];
    const params = [userId];
    if (type) {
      where.push(`type = $${params.length + 1}`);
      params.push(type);
    }
    const countR = await db.query(`SELECT COUNT(*)::int AS total FROM ${TX_TABLE} WHERE ${where.join(' AND ')}`, params);
    const total = countR.rows[0].total;
    const r = await db.query(
      `SELECT * FROM ${TX_TABLE} WHERE ${where.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    return { rows: r.rows, total, page, limit };
  },

  async totalCredits() {
    const r = await db.query(`SELECT COALESCE(SUM(balance),0)::bigint AS total FROM ${TABLE}`);
    return Number(r.rows[0].total);
  },
};

module.exports = Wallet;
