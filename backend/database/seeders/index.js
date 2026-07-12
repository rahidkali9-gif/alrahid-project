'use strict';

/**
 * Idempotent seed data. Uses ON CONFLICT so it can be run repeatedly.
 * Exports a single async function run(db, bcrypt).
 */
const logger = require('../../utils/logger');
const cryptoUtil = require('../../utils/crypto');

const ai = require('../../config/ai');

async function run(db, bcrypt) {
  const { query, transaction } = db;
  const env = require('../../config/env');

  const adminEmail = env.DEFAULT_ADMIN_EMAIL;
  const adminPass = env.DEFAULT_ADMIN_PASSWORD;
  const demoEmail = env.DEFAULT_DEMO_EMAIL;
  const demoPass = env.DEFAULT_DEMO_PASSWORD;

  const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
  const adminHash = await bcrypt.hash(adminPass, salt);
  const demoHash = await bcrypt.hash(demoPass, salt);

  // ── Users ──────────────────────────────────────────────────
  const adminRes = await query(
    `INSERT INTO users (name, email, password_hash, role, is_active)
     VALUES ($1, $2, $3, 'super_admin', TRUE)
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, is_active = TRUE
     RETURNING id, name, email, role`,
    ['Super Admin', adminEmail, adminHash]
  );
  const adminId = adminRes.rows[0].id;

  const demoRes = await query(
    `INSERT INTO users (name, email, password_hash, role, is_active)
     VALUES ($1, $2, $3, 'user', TRUE)
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash, is_active = TRUE
     RETURNING id, name, email, role`,
    ['Demo User', demoEmail, demoHash]
  );
  const demoId = demoRes.rows[0].id;

  // ── Profiles ───────────────────────────────────────────────
  await query(
    `INSERT INTO profiles (user_id, first_name, last_name, bio)
     VALUES ($1, 'Super', 'Admin', 'Al Rahid super administrator')
     ON CONFLICT (user_id) DO NOTHING`,
    [adminId]
  );
  await query(
    `INSERT INTO profiles (user_id, first_name, last_name, bio)
     VALUES ($1, 'Demo', 'User', 'Al Rahid demo user')
     ON CONFLICT (user_id) DO NOTHING`,
    [demoId]
  );

  // ── Wallets with welcome credits ───────────────────────────
  await query(
    `INSERT INTO wallets (user_id, balance, currency)
     VALUES ($1, 100000, 'credits')
     ON CONFLICT (user_id) DO UPDATE SET balance = 100000`,
    [adminId]
  );
  await query(
    `INSERT INTO wallets (user_id, balance, currency)
     VALUES ($1, 10000, 'credits')
     ON CONFLICT (user_id) DO UPDATE SET balance = 10000`,
    [demoId]
  );

  // ── Wallet transactions (welcome credit, idempotent by reference) ──
  await query(
    `INSERT INTO wallet_transactions (wallet_id, user_id, type, amount, balance_before, balance_after, reason, reference_type)
     SELECT w.id, $1, 'credit', 100000, 0, 100000, 'Welcome credits', 'seed'
     FROM wallets w WHERE w.user_id = $1
     AND NOT EXISTS (
       SELECT 1 FROM wallet_transactions wt
       WHERE wt.user_id = $1 AND wt.reference_type = 'seed' AND wt.reason = 'Welcome credits'
     )`,
    [adminId]
  );
  await query(
    `INSERT INTO wallet_transactions (wallet_id, user_id, type, amount, balance_before, balance_after, reason, reference_type)
     SELECT w.id, $1, 'credit', 10000, 0, 10000, 'Welcome credits', 'seed'
     FROM wallets w WHERE w.user_id = $1
     AND NOT EXISTS (
       SELECT 1 FROM wallet_transactions wt
       WHERE wt.user_id = $1 AND wt.reference_type = 'seed' AND wt.reason = 'Welcome credits'
     )`,
    [demoId]
  );

  // ── App settings ───────────────────────────────────────────
  const appSettings = [
    ['app_name', 'Al Rahid', 'general', true],
    ['primary_color', '#0d9488', 'theme', true],
    ['secondary_color', '#0f766e', 'theme', true],
    ['theme', 'dark', 'theme', true],
    ['support_email', 'support@alrahid.com', 'general', true],
    ['default_credits', '10000', 'wallet', false],
  ];
  for (const [key, value, category, isPublic] of appSettings) {
    await query(
      `INSERT INTO app_settings (key, value, category, is_public)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (key) DO UPDATE
         SET value = EXCLUDED.value, category = EXCLUDED.category, is_public = EXCLUDED.is_public`,
      [key, value, category, isPublic]
    );
  }

  // ── Feature toggles ────────────────────────────────────────
  const toggles = [
    ['ai_chat', true, 'AI Chat feature'],
    ['ai_image', true, 'AI Image generation'],
    ['ai_video', true, 'AI Video generation'],
    ['ai_voice', true, 'AI Voice generation'],
    ['ai_music', true, 'AI Music generation'],
    ['ai_logo', true, 'AI Logo generation'],
    ['ai_resume', true, 'AI Resume builder'],
    ['ai_presentation', true, 'AI Presentation builder'],
    ['ai_pdf_summary', true, 'AI PDF summary'],
    ['ai_code', true, 'AI Code generation'],
    ['ai_website', true, 'AI Website generation'],
    ['ai_app', true, 'AI App generation'],
    ['ai_email', true, 'AI Email writer'],
    ['ai_document', true, 'AI Document generation'],
    ['wallet', true, 'Wallet system'],
    ['uploads', true, 'File uploads'],
  ];
  for (const [key, enabled, desc] of toggles) {
    await query(
      `INSERT INTO feature_toggles (feature_key, is_enabled, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (feature_key) DO UPDATE
         SET description = EXCLUDED.description`,
      [key, enabled, desc]
    );
  }

  // ── AI provider settings ───────────────────────────────────
  const providers = [
    {
      provider: 'openai',
      api_base_url: ai.providers.openai.apiBaseUrl,
      api_key_encrypted: ai.providers.openai.apiKey ? cryptoUtil.encrypt(ai.providers.openai.apiKey) : null,
      default_model: ai.providers.openai.defaultModel,
      config: { imageModel: ai.providers.openai.imageModel },
    },
    {
      provider: 'openrouter',
      api_base_url: ai.providers.openrouter.apiBaseUrl,
      api_key_encrypted: ai.providers.openrouter.apiKey ? cryptoUtil.encrypt(ai.providers.openrouter.apiKey) : null,
      default_model: ai.providers.openrouter.defaultModel,
      config: {},
    },
    {
      provider: 'groq',
      api_base_url: ai.providers.groq.apiBaseUrl,
      api_key_encrypted: ai.providers.groq.apiKey ? cryptoUtil.encrypt(ai.providers.groq.apiKey) : null,
      default_model: ai.providers.groq.defaultModel,
      config: {},
    },
    {
      provider: 'ollama',
      api_base_url: ai.providers.ollama.apiBaseUrl,
      api_key_encrypted: null,
      default_model: ai.providers.ollama.defaultModel,
      config: {},
    },
  ];
  for (const p of providers) {
    await query(
      `INSERT INTO ai_provider_settings (provider, api_base_url, api_key_encrypted, default_model, is_active, config)
       VALUES ($1, $2, $3, $4, TRUE, $5::jsonb)
       ON CONFLICT (provider) DO UPDATE
         SET api_base_url = EXCLUDED.api_base_url,
             api_key_encrypted = COALESCE(EXCLUDED.api_key_encrypted, ai_provider_settings.api_key_encrypted),
             default_model = EXCLUDED.default_model,
             config = EXCLUDED.config`,
      [p.provider, p.api_base_url, p.api_key_encrypted, p.default_model, JSON.stringify(p.config)]
    );
  }

  // ── Welcome notifications ──────────────────────────────────
  for (const userId of [adminId, demoId]) {
    await query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, 'Welcome to Al Rahid', 'Your account is ready. You have been granted welcome credits.', 'success')
       ON CONFLICT DO NOTHING`,
      [userId]
    );
  }

  // ── Default prompts ────────────────────────────────────────
  const defaultPrompts = [
    { name: 'Default Chat', type: 'chat', system_prompt: 'You are Al Rahid, a helpful AI assistant.', user_template: '{{prompt}}' },
    { name: 'Email Writer', type: 'email', system_prompt: 'You are an expert email writer. Write clear, professional emails.', user_template: 'Write an email about: {{prompt}}' },
    { name: 'Code Generator', type: 'code', system_prompt: 'You are an expert software engineer. Provide production-ready code.', user_template: '{{prompt}}' },
  ];
  for (const pr of defaultPrompts) {
    await query(
      `INSERT INTO prompts (name, type, system_prompt, user_template, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       ON CONFLICT DO NOTHING`,
      [pr.name, pr.type, pr.system_prompt, pr.user_template]
    );
  }

  logger.info('Seed complete', {
    admin: { id: adminId, email: adminEmail },
    demo: { id: demoId, email: demoEmail },
    appSettings: appSettings.length,
    toggles: toggles.length,
    providers: providers.length,
  });

  return { adminId, demoId };
}

module.exports = { run };
