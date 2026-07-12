'use strict';

/**
 * PM2 ecosystem configuration for Al Rahid backend.
 * Start with: pm2 start ecosystem.config.js
 */
module.exports = {
  apps: [
    {
      name: 'alrahid-backend',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
  ],
};
