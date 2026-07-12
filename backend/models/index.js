'use strict';

/**
 * Model index — central registry of all models.
 */
const User = require('./User');
const Profile = require('./Profile');
const Setting = require('./Setting');
const Notification = require('./Notification');
const Wallet = require('./Wallet');
const ActivityLog = require('./ActivityLog');
const ApiKey = require('./ApiKey');
const AiGeneration = require('./AiGeneration');
const History = require('./History');
const Upload = require('./Upload');
const PasswordChange = require('./PasswordChange');
const AppSetting = require('./AppSetting');
const FeatureToggle = require('./FeatureToggle');
const AiProviderSetting = require('./AiProviderSetting');
const AdminAction = require('./AdminAction');

module.exports = {
  User,
  Profile,
  Setting,
  Notification,
  Wallet,
  ActivityLog,
  ApiKey,
  AiGeneration,
  History,
  Upload,
  PasswordChange,
  AppSetting,
  FeatureToggle,
  AiProviderSetting,
  AdminAction,
};
