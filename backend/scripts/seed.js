'use strict';

/**
 * Seed runner. Calls database/seeders/index.js which is idempotent.
 */
const db = require('../database');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const seeders = require('../database/seeders');

async function main() {
  logger.info('Seeding database...');
  await seeders.run(db, bcrypt);
  logger.info('Seed complete.');
}

main()
  .then(async () => {
    await db.close();
    process.exit(0);
  })
  .catch(async (err) => {
    logger.error('Seed failed', { error: err.message, stack: err.stack });
    await db.close();
    process.exit(1);
  });
