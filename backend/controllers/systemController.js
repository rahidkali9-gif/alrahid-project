'use strict';

/**
 * System controller — health, public info, feature flags, public app settings.
 */
const db = require('../database');
const models = require('../models');
const config = require('../config');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.health = asyncHandler(async (req, res) => {
  let dbOk = false;
  try {
    dbOk = await db.ping();
  } catch (e) {
    dbOk = false;
  }
  return res.status(200).json({
    success: true,
    message: 'Al Rahid backend is running',
    data: {
      status: 'ok',
      service: config.app.name,
      env: config.env.NODE_ENV,
      db: dbOk ? 'connected' : 'disconnected',
      time: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
    },
  });
});

exports.info = asyncHandler(async (req, res) => {
  let settings = {};
  let features = {};
  try {
    const publicSettings = await models.AppSetting.list({ publicOnly: true });
    for (const s of publicSettings) settings[s.key] = s.value;
    const toggles = await models.FeatureToggle.list();
    for (const t of toggles) features[t.feature_key] = t.is_enabled;
  } catch (e) {
    // degrade gracefully if DB is unavailable
  }
  return ApiResponse.success(res, 'Public info', {
    app: {
      name: config.app.name,
      version: '1.0.0',
    },
    settings,
    features,
    ai: {
      types: config.ai.types,
      costs: config.ai.costs,
      activeProvider: config.ai.activeProvider,
    },
  });
});

exports.featureToggles = asyncHandler(async (req, res) => {
  let obj = {};
  try {
    const toggles = await models.FeatureToggle.list();
    for (const t of toggles) obj[t.feature_key] = t.is_enabled;
  } catch (e) {
    // degrade gracefully
  }
  return ApiResponse.success(res, 'Feature toggles', { features: obj });
});
