'use strict';

/**
 * Admin service — dashboard stats, user management, provider/app/feature
 * settings CRUD, notifications broadcast, analytics, logs viewer,
 * system info, media manager, prompt/banner/ads CRUD, admin audit log.
 */
const db = require('../database');
const models = require('../models');
const ApiError = require('../utils/ApiError');
const ai = require('../config/ai');
const files = require('../utils/files');
const logger = require('../utils/logger');

async function audit(adminId, action, resource, resourceId, metadata = {}) {
  return models.AdminAction.create({ adminId, action, resource, resourceId, metadata });
}

// ── Dashboard ─────────────────────────────────────────────────
async function dashboardStats() {
  const userCount = await models.User.count();
  const aiCount = await models.AiGeneration.count();
  const totalCredits = await models.Wallet.totalCredits();
  const activeUsers = await db.query(
    `SELECT COUNT(*)::int AS total FROM users WHERE is_active = TRUE`
  );
  const todaySignups = await db.query(
    `SELECT COUNT(*)::int AS total FROM users WHERE created_at >= date_trunc('day', NOW())`
  );
  const last7 = await db.query(
    `SELECT COUNT(*)::int AS total FROM users WHERE created_at >= NOW() - INTERVAL '7 days'`
  );
  return {
    userCount,
    aiCount,
    totalCredits,
    activeUsers: activeUsers.rows[0].total,
    todaySignups: todaySignups.rows[0].total,
    last7Signups: last7.rows[0].total,
  };
}

// ── User management ───────────────────────────────────────────
async function listUsers({ page = 1, limit = 20, search = '', role = '', isActive = null } = {}) {
  return models.User.list({ page, limit, search, role, isActive });
}

async function getUser(id) {
  const user = await models.User.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  const profile = await models.Profile.findByUserId(id);
  const wallet = await models.Wallet.getBalance(id);
  return { ...user, profile, wallet };
}

async function updateUserRole(adminId, userId, role) {
  if (!['user', 'admin', 'super_admin'].includes(role)) {
    throw ApiError.badRequest('Invalid role');
  }
  const user = await models.User.update(userId, { role });
  if (!user) throw ApiError.notFound('User not found');
  await audit(adminId, 'update_role', 'user', userId, { role });
  return user;
}

async function activateUser(adminId, userId, active) {
  const user = await models.User.update(userId, { is_active: active });
  if (!user) throw ApiError.notFound('User not found');
  await audit(adminId, active ? 'activate_user' : 'deactivate_user', 'user', userId, {});
  return user;
}

async function deleteUser(adminId, userId) {
  const user = await models.User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'super_admin') throw ApiError.forbidden('Cannot delete super admin');
  await models.User.delete(userId);
  await audit(adminId, 'delete_user', 'user', userId, { email: user.email });
  return true;
}

// ── AI provider settings ──────────────────────────────────────
async function listAiProviders() {
  return models.AiProviderSetting.list();
}

async function upsertAiProvider(adminId, payload) {
  const row = await models.AiProviderSetting.upsert(payload);
  await audit(adminId, 'upsert_ai_provider', 'ai_provider_settings', row.id, { provider: payload.provider });
  return row;
}

async function deleteAiProvider(adminId, provider) {
  const ok = await models.AiProviderSetting.delete(provider);
  await audit(adminId, 'delete_ai_provider', 'ai_provider_settings', null, { provider });
  return ok;
}

// ── App settings ──────────────────────────────────────────────
async function listAppSettings({ publicOnly = false, category = null } = {}) {
  return models.AppSetting.list({ publicOnly, category });
}

async function upsertAppSetting(adminId, payload) {
  const row = await models.AppSetting.upsert(payload);
  await audit(adminId, 'upsert_app_setting', 'app_settings', row.id, { key: payload.key });
  return row;
}

async function deleteAppSetting(adminId, key) {
  const ok = await models.AppSetting.delete(key);
  await audit(adminId, 'delete_app_setting', 'app_settings', null, { key });
  return ok;
}

// ── Feature toggles ───────────────────────────────────────────
async function listFeatureToggles() {
  return models.FeatureToggle.list();
}

async function upsertFeatureToggle(adminId, payload) {
  const row = await models.FeatureToggle.upsert(payload);
  await audit(adminId, 'upsert_feature_toggle', 'feature_toggles', row.id, { featureKey: payload.featureKey });
  return row;
}

async function deleteFeatureToggle(adminId, featureKey) {
  const ok = await models.FeatureToggle.delete(featureKey);
  await audit(adminId, 'delete_feature_toggle', 'feature_toggles', null, { featureKey });
  return ok;
}

// ── Notifications broadcast ───────────────────────────────────
async function broadcastNotification(adminId, { userId = null, title, message, type = 'info' }) {
  if (userId) {
    const n = await models.Notification.create({ userId, title, message, type });
    await audit(adminId, 'broadcast_notification', 'notifications', n.id, { userId, title });
    return { sent: 1 };
  }
  const allUsers = await db.query(`SELECT id FROM users WHERE is_active = TRUE`);
  let count = 0;
  for (const u of allUsers.rows) {
    await models.Notification.create({ userId: u.id, title, message, type });
    count++;
  }
  await audit(adminId, 'broadcast_notification', 'notifications', null, { title, count });
  return { sent: count };
}

// ── API keys management ───────────────────────────────────────
async function listAllApiKeys({ page = 1, limit = 20 } = {}) {
  return models.ApiKey.listAll({ page, limit });
}

// ── Analytics ─────────────────────────────────────────────────
async function analytics() {
  const registrations = await models.User.recentRegistrations(30);
  const aiUsage = await models.AiGeneration.usageByType();
  const walletFlow = await db.query(
    `SELECT type, COALESCE(SUM(amount),0)::bigint AS total, COUNT(*)::int AS count
     FROM wallet_transactions GROUP BY type ORDER BY type`
  );
  const generationsByStatus = await db.query(
    `SELECT status, COUNT(*)::int AS count FROM ai_generations GROUP BY status`
  );
  return {
    registrations,
    aiUsage,
    walletFlow: walletFlow.rows,
    generationsByStatus: generationsByStatus.rows,
  };
}

// ── Logs viewer ───────────────────────────────────────────────
async function listActivityLogs({ page = 1, limit = 20, userId = null, category = null } = {}) {
  return models.ActivityLog.listAll({ page, limit, userId, category });
}

// ── System settings ───────────────────────────────────────────
async function systemInfo() {
  let dbOk = false;
  try {
    await db.ping();
    dbOk = true;
  } catch (e) {
    dbOk = false;
  }
  const providers = await models.AiProviderSetting.list();
  const activeProvider = ai.activeProvider;
  const mem = process.memoryUsage();
  return {
    server: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      uptimeSeconds: Math.round(process.uptime()),
      memory: {
        rss: mem.rss,
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
      },
    },
    database: { connected: dbOk },
    ai: {
      activeProvider,
      providers,
    },
    time: new Date().toISOString(),
  };
}

// ── Media manager ─────────────────────────────────────────────
async function listMedia({ page = 1, limit = 20 } = {}) {
  return models.Upload.listAll({ page, limit });
}

async function deleteMedia(adminId, id) {
  const row = await models.Upload.delete(id);
  if (!row) throw ApiError.notFound('Media not found');
  files.deleteFile(row.path);
  await audit(adminId, 'delete_media', 'uploads', id, { path: row.path });
  return true;
}

// ── Prompt manager ────────────────────────────────────────────
async function listPrompts() {
  const r = await db.query(`SELECT * FROM prompts ORDER BY created_at DESC`);
  return r.rows;
}
async function getPrompt(id) {
  const r = await db.query(`SELECT * FROM prompts WHERE id = $1`, [id]);
  return r.rows[0] || null;
}
async function createPrompt(adminId, payload) {
  const r = await db.query(
    `INSERT INTO prompts (name, type, system_prompt, user_template, is_active)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [payload.name, payload.type, payload.system_prompt || null, payload.user_template || null, payload.is_active !== false]
  );
  await audit(adminId, 'create_prompt', 'prompts', r.rows[0].id, { name: payload.name });
  return r.rows[0];
}
async function updatePrompt(adminId, id, payload) {
  const r = await db.query(
    `UPDATE prompts SET name=COALESCE($1,name), type=COALESCE($2,type),
       system_prompt=COALESCE($3,system_prompt), user_template=COALESCE($4,user_template),
       is_active=COALESCE($5,is_active) WHERE id=$6 RETURNING *`,
    [payload.name, payload.type, payload.system_prompt, payload.user_template, payload.is_active, id]
  );
  if (!r.rows[0]) throw ApiError.notFound('Prompt not found');
  await audit(adminId, 'update_prompt', 'prompts', id, { name: payload.name });
  return r.rows[0];
}
async function deletePrompt(adminId, id) {
  const r = await db.query(`DELETE FROM prompts WHERE id=$1 RETURNING id`, [id]);
  if (!r.rowCount) throw ApiError.notFound('Prompt not found');
  await audit(adminId, 'delete_prompt', 'prompts', id, {});
  return true;
}

// ── Banner manager ────────────────────────────────────────────
async function listBanners() {
  const r = await db.query(`SELECT * FROM banners ORDER BY created_at DESC`);
  return r.rows;
}
async function createBanner(adminId, payload) {
  const r = await db.query(
    `INSERT INTO banners (title, image_url, target_url, position, is_active, start_date, end_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [payload.title, payload.image_url || null, payload.target_url || null, payload.position || 'home_top',
     payload.is_active !== false, payload.start_date || null, payload.end_date || null]
  );
  await audit(adminId, 'create_banner', 'banners', r.rows[0].id, { title: payload.title });
  return r.rows[0];
}
async function updateBanner(adminId, id, payload) {
  const r = await db.query(
    `UPDATE banners SET title=COALESCE($1,title), image_url=COALESCE($2,image_url),
       target_url=COALESCE($3,target_url), position=COALESCE($4,position),
       is_active=COALESCE($5,is_active), start_date=COALESCE($6,start_date), end_date=COALESCE($7,end_date)
       WHERE id=$8 RETURNING *`,
    [payload.title, payload.image_url, payload.target_url, payload.position, payload.is_active, payload.start_date, payload.end_date, id]
  );
  if (!r.rows[0]) throw ApiError.notFound('Banner not found');
  await audit(adminId, 'update_banner', 'banners', id, {});
  return r.rows[0];
}
async function deleteBanner(adminId, id) {
  const r = await db.query(`DELETE FROM banners WHERE id=$1 RETURNING id`, [id]);
  if (!r.rowCount) throw ApiError.notFound('Banner not found');
  await audit(adminId, 'delete_banner', 'banners', id, {});
  return true;
}

// ── Ads manager ───────────────────────────────────────────────
async function listAds() {
  const r = await db.query(`SELECT * FROM ads ORDER BY created_at DESC`);
  return r.rows;
}
async function createAd(adminId, payload) {
  const r = await db.query(
    `INSERT INTO ads (placement, title, content, image_url, target_url, is_active, start_date, end_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [payload.placement, payload.title || null, payload.content || null, payload.image_url || null,
     payload.target_url || null, payload.is_active !== false, payload.start_date || null, payload.end_date || null]
  );
  await audit(adminId, 'create_ad', 'ads', r.rows[0].id, { placement: payload.placement });
  return r.rows[0];
}
async function updateAd(adminId, id, payload) {
  const r = await db.query(
    `UPDATE ads SET placement=COALESCE($1,placement), title=COALESCE($2,title), content=COALESCE($3,content),
       image_url=COALESCE($4,image_url), target_url=COALESCE($5,target_url), is_active=COALESCE($6,is_active),
       start_date=COALESCE($7,start_date), end_date=COALESCE($8,end_date) WHERE id=$9 RETURNING *`,
    [payload.placement, payload.title, payload.content, payload.image_url, payload.target_url, payload.is_active, payload.start_date, payload.end_date, id]
  );
  if (!r.rows[0]) throw ApiError.notFound('Ad not found');
  await audit(adminId, 'update_ad', 'ads', id, {});
  return r.rows[0];
}
async function deleteAd(adminId, id) {
  const r = await db.query(`DELETE FROM ads WHERE id=$1 RETURNING id`, [id]);
  if (!r.rowCount) throw ApiError.notFound('Ad not found');
  await audit(adminId, 'delete_ad', 'ads', id, {});
  return true;
}

// ── Admin actions audit log ───────────────────────────────────
async function listAdminActions({ page = 1, limit = 20, adminId = null, action = null } = {}) {
  return models.AdminAction.list({ page, limit, adminId, action });
}

module.exports = {
  audit,
  dashboardStats,
  listUsers,
  getUser,
  updateUserRole,
  activateUser,
  deleteUser,
  listAiProviders,
  upsertAiProvider,
  deleteAiProvider,
  listAppSettings,
  upsertAppSetting,
  deleteAppSetting,
  listFeatureToggles,
  upsertFeatureToggle,
  deleteFeatureToggle,
  broadcastNotification,
  listAllApiKeys,
  analytics,
  listActivityLogs,
  systemInfo,
  listMedia,
  deleteMedia,
  listPrompts,
  getPrompt,
  createPrompt,
  updatePrompt,
  deletePrompt,
  listBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  listAds,
  createAd,
  updateAd,
  deleteAd,
  listAdminActions,
};
