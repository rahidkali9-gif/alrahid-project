'use strict';

/**
 * Email service — stub implementation that logs emails (no SMTP configured).
 * Replace with nodemailer/SES/etc. for production. API stays stable.
 */
const logger = require('../utils/logger');
const env = require('../config/env');

async function send({ to, subject, html, text = null }) {
  logger.info('Email send (stub)', { to, subject, app: env.APP_NAME });
  // In production, integrate with SMTP/SendGrid/SES here.
  return { sent: true, to, subject, deliveredAt: new Date().toISOString(), provider: 'stub' };
}

async function sendWelcome(to) {
  return send({
    to,
    subject: `Welcome to ${env.APP_NAME}`,
    html: `<h1>Welcome to ${env.APP_NAME}</h1><p>Your account is ready.</p>`,
    text: `Welcome to ${env.APP_NAME}. Your account is ready.`,
  });
}

async function sendPasswordReset(to, resetUrl) {
  return send({
    to,
    subject: `${env.APP_NAME} — Password Reset`,
    html: `<p>Reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    text: `Reset your password: ${resetUrl}`,
  });
}

module.exports = {
  send,
  sendWelcome,
  sendPasswordReset,
};
