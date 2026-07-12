'use strict';

/**
 * Express application factory. Wires middleware, routes, health,
 * static assets, and the centralized error handler.
 */
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const config = require('./config');
const security = require('./config/security');
const logger = require('./utils/logger');
const { general: generalLimiter } = require('./middleware/rateLimit');
const { errorHandler, notFound } = require('./middleware/error');
const apiRoutes = require('./routes');

function createApp() {
  const app = express();

  // Trust proxy (for accurate req.ip behind reverse proxy / load balancer)
  app.set('trust proxy', 1);

  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  }));

  // CORS
  app.use(cors(security.cors));

  // Compression
  app.use(compression());

  // Body parsers
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Cookies
  app.use(cookieParser());

  // HTTP request logging
  app.use(morgan('combined', { stream: logger.stream }));

  // Static assets — uploads and public
  app.use(`/${config.env.UPLOAD_DIR}`, express.static(path.resolve(config.env.UPLOAD_DIR), {
    maxAge: '7d',
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  }));
  app.use(express.static(path.resolve('public'), { maxAge: '1h' }));

  // Health check (no rate limit)
  app.get('/health', async (req, res) => {
    const db = require('./database');
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

  // API routes (rate-limited)
  app.use('/api', generalLimiter, apiRoutes);

  // 404 + error handler
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
