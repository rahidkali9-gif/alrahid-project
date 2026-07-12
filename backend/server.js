'use strict';

/**
 * Server bootstrap. Creates the app, starts an HTTP server, pings the DB
 * on boot (warns but does not crash if unreachable), and handles graceful
 * shutdown on SIGINT/SIGTERM plus unhandled rejections / uncaught exceptions.
 */
const http = require('http');
const config = require('./config');
const logger = require('./utils/logger');
const db = require('./database');
const createApp = require('./app');

const app = createApp();
const server = http.createServer(app);

const PORT = config.app.port;
const HOST = config.app.host;

async function start() {
  // Ping DB — warn but do not crash
  try {
    const ok = await db.ping();
    if (ok) {
      logger.info('Database connection OK', { host: config.db.host, db: config.db.database });
    } else {
      logger.warn('Database ping returned false — starting anyway');
    }
  } catch (e) {
    logger.warn('Database unreachable on boot — starting anyway', { error: e.message });
  }

  server.listen(PORT, HOST, () => {
    logger.info(`${config.app.name} server listening`, {
      host: HOST,
      port: PORT,
      env: config.env.NODE_ENV,
      pid: process.pid,
    });
  });
}

// Graceful shutdown
let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
  });
  try {
    await db.close();
  } catch (e) {
    logger.error('Error closing DB pool', { error: e.message });
  }
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', { reason: reason && reason.message, stack: reason && reason.stack });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  // Attempt graceful shutdown then exit
  shutdown('uncaughtException');
});

start().catch((err) => {
  logger.error('Failed to start server', { error: err.message, stack: err.stack });
  process.exit(1);
});

module.exports = { app, server };
