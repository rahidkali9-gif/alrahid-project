'use strict';

/**
 * AI provider settings model. API keys are AES-encrypted at rest.
 */
const db = require('../database');
const cryptoUtil = require('../utils/crypto');

const TABLE = 'ai_provider_settings';

const AiProviderSetting = {
  TABLE,

  async list() {
    const r = await db.query(`SELECT id, provider, api_base_url, default_model, is_active, config, created_at, updated_at FROM ${TABLE} ORDER BY provider ASC`);
    return r.rows;
  },

  async findByProvider(provider) {
    const r = await db.query(`SELECT * FROM ${TABLE} WHERE provider = $1`, [provider]);
    return r.rows[0] || null;
  },

  async getDecrypted(provider) {
    const row = await this.findByProvider(provider);
    if (!row) return null;
    let apiKey = null;
    if (row.api_key_encrypted) {
      try {
        apiKey = cryptoUtil.decrypt(row.api_key_encrypted);
      } catch (e) {
        apiKey = null;
      }
    }
    return { ...row, api_key: apiKey };
  },

  async upsert({ provider, apiBaseUrl, apiKey = null, defaultModel = null, isActive = true, config = {} }) {
    const enc = apiKey ? cryptoUtil.encrypt(apiKey) : null;
    const r = await db.query(
      `INSERT INTO ${TABLE} (provider, api_base_url, api_key_encrypted, default_model, is_active, config)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)
       ON CONFLICT (provider) DO UPDATE
         SET api_base_url = EXCLUDED.api_base_url,
             api_key_encrypted = COALESCE(EXCLUDED.api_key_encrypted, ai_provider_settings.api_key_encrypted),
             default_model = EXCLUDED.default_model,
             is_active = EXCLUDED.is_active,
             config = EXCLUDED.config
       RETURNING id, provider, api_base_url, default_model, is_active, config, created_at, updated_at`,
      [provider, apiBaseUrl, enc, defaultModel, isActive, JSON.stringify(config)]
    );
    return r.rows[0];
  },

  async delete(provider) {
    const r = await db.query(`DELETE FROM ${TABLE} WHERE provider = $1 RETURNING id`, [provider]);
    return r.rowCount > 0;
  },
};

module.exports = AiProviderSetting;
