'use strict';

/**
 * Crypto helpers — random tokens, hashing, encryption.
 */
const crypto = require('crypto');
const env = require('../config/env');

const ALGO = 'aes-256-cbc';
const IV_LEN = 16;

/**
 * Generate a random hex token (default 32 bytes => 64 hex chars).
 */
function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate a random alphanumeric id (default 16 chars).
 */
function randomId(len = 16) {
  return crypto.randomBytes(len).toString('base64url').slice(0, len);
}

/**
 * SHA-256 hash a string (used for API key storage).
 */
function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

/**
 * Hash a string with bcrypt-compatible cost via PBKDF2 fallback (not used for passwords).
 */
function hmac(value, secret = env.JWT_SECRET) {
  return crypto.createHmac('sha256', secret).update(String(value)).digest('hex');
}

/**
 * Generate a prefixed API key. Returns { raw, prefix, hash }.
 */
function generateApiKey(prefix = env.API_KEY_PREFIX) {
  const body = crypto.randomBytes(24).toString('base64url');
  const raw = `${prefix}${body}`;
  return {
    raw,
    prefix,
    hash: sha256(raw),
  };
}

/**
 * Encrypt a value with AES-256-CBC using JWT_SECRET-derived key.
 * Returns base64 "iv:ciphertext".
 */
function encrypt(value) {
  const key = crypto.createHash('sha256').update(env.JWT_SECRET).digest();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  let enc = cipher.update(String(value), 'utf8', 'base64');
  enc += cipher.final('base64');
  return `${iv.toString('base64')}:${enc}`;
}

/**
 * Decrypt a value produced by encrypt().
 */
function decrypt(payload) {
  const [ivB64, data] = String(payload).split(':');
  if (!ivB64 || !data) throw new Error('Invalid encrypted payload');
  const key = crypto.createHash('sha256').update(env.JWT_SECRET).digest();
  const iv = Buffer.from(ivB64, 'base64');
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  let dec = decipher.update(data, 'base64', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

/**
 * Constant-time string comparison.
 */
function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

module.exports = {
  randomToken,
  randomId,
  sha256,
  hmac,
  generateApiKey,
  encrypt,
  decrypt,
  safeEqual,
};
