'use strict';

/**
 * Central config index. Aggregates all configuration namespaces.
 */
const env = require('./env');
const db = require('./db');
const security = require('./security');
const rateLimit = require('./rateLimit');
const ai = require('./ai');

module.exports = {
  env,
  db,
  security,
  rateLimit,
  ai,
  app: {
    name: env.APP_NAME,
    url: env.APP_URL,
    port: env.PORT,
    host: env.HOST,
    nodeEnv: env.NODE_ENV,
    isProd: env.NODE_ENV === 'production',
    isDev: env.NODE_ENV === 'development',
  },
};
