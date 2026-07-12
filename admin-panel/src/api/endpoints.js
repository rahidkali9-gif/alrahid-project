import api from './client.js';

/**
 * All Al Rahid admin API endpoint functions.
 * Each returns a promise that resolves to the unwrapped response
 * ({ success, message, data, meta }).
 */

// ── Auth ────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  changePassword: (currentPassword, password) =>
    api.post('/auth/change-password', { currentPassword, password }),
};

// ── Admin: dashboard ────────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get('/admin/dashboard'),
};

// ── Admin: users ────────────────────────────────────────────────
export const usersApi = {
  list: (params = {}) => api.get('/admin/users', { params }),
  get: (id) => api.get(`/admin/users/${id}`),
  updateRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  activate: (id, active) => api.patch(`/admin/users/${id}/activate`, { active }),
  remove: (id) => api.delete(`/admin/users/${id}`),
};

// ── Admin: wallet ───────────────────────────────────────────────
export const walletApi = {
  adjust: (payload) => api.post('/admin/wallet/adjust', payload),
};

// ── Admin: AI providers ─────────────────────────────────────────
export const aiProvidersApi = {
  list: () => api.get('/admin/ai-providers'),
  upsert: (payload) => api.post('/admin/ai-providers', payload),
  remove: (provider) => api.delete(`/admin/ai-providers/${provider}`),
};

// ── Admin: app settings ─────────────────────────────────────────
export const appSettingsApi = {
  list: (params = {}) => api.get('/admin/app-settings', { params }),
  upsert: (payload) => api.post('/admin/app-settings', payload),
  remove: (key) => api.delete(`/admin/app-settings/${key}`),
};

// ── Admin: feature toggles ──────────────────────────────────────
export const featureTogglesApi = {
  list: () => api.get('/admin/feature-toggles'),
  upsert: (payload) => api.post('/admin/feature-toggles', payload),
  remove: (key) => api.delete(`/admin/feature-toggles/${key}`),
};

// ── Admin: notifications broadcast ──────────────────────────────
export const notificationsApi = {
  broadcast: (payload) => api.post('/admin/notifications/broadcast', payload),
  // current admin's own notifications
  mine: (params = {}) => api.get('/notifications', { params }),
  unreadCount: () => api.get('/notifications/unread/count'),
};

// ── Admin: API keys ─────────────────────────────────────────────
export const apiKeysApi = {
  list: (params = {}) => api.get('/admin/api-keys', { params }),
};

// ── Admin: analytics ────────────────────────────────────────────
export const analyticsApi = {
  get: () => api.get('/admin/analytics'),
};

// ── Admin: activity logs ────────────────────────────────────────
export const activityApi = {
  list: (params = {}) => api.get('/admin/logs', { params }),
  mine: (params = {}) => api.get('/activity', { params }),
};

// ── Admin: system info ──────────────────────────────────────────
export const systemApi = {
  info: () => api.get('/admin/system'),
};

// ── Admin: media ────────────────────────────────────────────────
export const mediaApi = {
  list: (params = {}) => api.get('/admin/media', { params }),
  remove: (id) => api.delete(`/admin/media/${id}`),
};

// ── Admin: prompts ──────────────────────────────────────────────
export const promptsApi = {
  list: () => api.get('/admin/prompts'),
  create: (payload) => api.post('/admin/prompts', payload),
  update: (id, payload) => api.patch(`/admin/prompts/${id}`, payload),
  remove: (id) => api.delete(`/admin/prompts/${id}`),
};

// ── Admin: banners ──────────────────────────────────────────────
export const bannersApi = {
  list: () => api.get('/admin/banners'),
  create: (payload) => api.post('/admin/banners', payload),
  update: (id, payload) => api.patch(`/admin/banners/${id}`, payload),
  remove: (id) => api.delete(`/admin/banners/${id}`),
};

// ── Admin: ads ──────────────────────────────────────────────────
export const adsApi = {
  list: () => api.get('/admin/ads'),
  create: (payload) => api.post('/admin/ads', payload),
  update: (id, payload) => api.patch(`/admin/ads/${id}`, payload),
  remove: (id) => api.delete(`/admin/ads/${id}`),
};

// ── AI history (all users via /ai/history) ──────────────────────
export const aiApi = {
  types: () => api.get('/ai'),
  history: (params = {}) => api.get('/ai/history', { params }),
};

// ── Uploads ─────────────────────────────────────────────────────
export const uploadsApi = {
  list: (params = {}) => api.get('/uploads', { params }),
  upload: (formData) =>
    api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  remove: (id) => api.delete(`/uploads/${id}`),
};

export default {
  auth: authApi,
  dashboard: dashboardApi,
  users: usersApi,
  wallet: walletApi,
  aiProviders: aiProvidersApi,
  appSettings: appSettingsApi,
  featureToggles: featureTogglesApi,
  notifications: notificationsApi,
  apiKeys: apiKeysApi,
  analytics: analyticsApi,
  activity: activityApi,
  system: systemApi,
  media: mediaApi,
  prompts: promptsApi,
  banners: bannersApi,
  ads: adsApi,
  ai: aiApi,
  uploads: uploadsApi,
};
