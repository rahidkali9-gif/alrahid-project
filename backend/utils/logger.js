'use strict';

/**
 * Winston logger. File transports (error.log + combined.log) plus a
 * colorized console transport in development.
 */
const fs = require('fs');
const path = require('path');
const winston = require('winston');

const env = require('../config/env');

const LOG_DIR = env.LOG_DIR || 'logs';
const LOG_LEVEL = env.LOG_LEVEL || 'info';

// Ensure log directory exists
try {
  fs.mkdirSync(path.resolve(process.cwd(), LOG_DIR), { recursive: true });
} catch (e) {
  // ignore
}

const logDir = path.resolve(process.cwd(), LOG_DIR);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = [
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 10 * 1024 * 1024,
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: fileFormat,
    maxsize: 10 * 1024 * 1024,
    maxFiles: 5,
  }),
];

if (env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      level: LOG_LEVEL,
      format: consoleFormat,
    })
  );
} else {
  // Still log to console in prod, but plain JSON
  transports.push(
    new winston.transports.Console({
      level: LOG_LEVEL,
      format: fileFormat,
    })
  );
}

const logger = winston.createLogger({
  level: LOG_LEVEL,
  levels: winston.config.npm.levels,
  transports,
  exitOnError: false,
});

// Stream for morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
