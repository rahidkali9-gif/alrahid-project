'use strict';

/**
 * Security-related configuration (JWT, bcrypt, cors, cookies).
 */
const env = require('./env');

const security = {
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    refreshExpiresSeconds: parseDurationToSeconds(env.JWT_REFRESH_EXPIRES_IN, 7 * 24 * 3600),
    accessExpiresSeconds: parseDurationToSeconds(env.JWT_EXPIRES_IN, 15 * 60),
  },
  bcrypt: {
    saltRounds: env.BCRYPT_SALT_ROUNDS,
  },
  cors: {
    origin: parseCorsOrigin(env.CORS_ORIGIN),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Api-Key', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page'],
  },
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: parseDurationToSeconds(env.JWT_REFRESH_EXPIRES_IN, 7 * 24 * 3600) * 1000,
  },
  apiKeyPrefix: env.API_KEY_PREFIX,
};

function parseCorsOrigin(origin) {
  if (!origin || origin === '*') return '*';
  // support comma-separated list
  if (origin.includes(',')) {
    return origin.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return origin;
}

function parseDurationToSeconds(duration, fallback) {
  if (!duration || typeof duration !== 'string') return fallback;
  const match = duration.match(/^(\d+)\s*(s|m|h|d)$/i);
  if (!match) {
    const n = parseInt(duration, 10);
    return Number.isFinite(n) ? n : fallback;
  }
  const num = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  switch (unit) {
    case 's': return num;
    case 'm': return num * 60;
    case 'h': return num * 3600;
    case 'd': return num * 86400;
    default: return fallback;
  }
}

module.exports = security;
