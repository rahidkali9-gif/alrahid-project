'use strict';

/**
 * Rate limiter middleware presets.
 */
const rateLimit = require('express-rate-limit');
const config = require('../config/rateLimit');

const general = rateLimit({
  windowMs: config.general.windowMs,
  max: config.general.max,
  standardHeaders: config.general.standardHeaders,
  legacyHeaders: config.general.legacyHeaders,
  message: config.general.message,
});

const auth = rateLimit({
  windowMs: config.auth.windowMs,
  max: config.auth.max,
  standardHeaders: config.auth.standardHeaders,
  legacyHeaders: config.auth.legacyHeaders,
  message: config.auth.message,
});

module.exports = {
  general,
  auth,
};
