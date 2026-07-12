'use strict';

/**
 * Feature toggle model.
 */
const db = require('../database');

const TABLE = 'feature_toggles';

const FeatureToggle = {
  TABLE,

  async list() {
    const r = await db.query(`SELECT * FROM ${TABLE} ORDER BY feature_key ASC`);
    return r.rows;
  },

  async get(featureKey) {
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE feature_key = $1`, [featureKey]);
    return r.rows[0] || null;
  },

  async isEnabled(featureKey) {
    const row = await this.get(featureKey);
    return !!row && row.is_enabled;
  },

  async upsert({ featureKey, isEnabled, description = null }) {
    const r = await db.query(
      `INSERT INTO ${TABLE} (feature_key, is_enabled, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (feature_key) DO UPDATE
         SET is_enabled = EXCLUDED.is_enabled,
             description = COALESCE(EXCLUDED.description, feature_toggles.description)
       RETURNING *`,
      [featureKey, isEnabled, description]
    );
    return r.rows[0];
  },

  async delete(featureKey) {
    const r = await db.query(`DELETE FROM ${TABLE} WHERE feature_key = $1 RETURNING id`, [featureKey]);
    return r.rowCount > 0;
  },
};

module.exports = FeatureToggle;
