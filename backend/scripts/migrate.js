'use strict';

/**
 * Migration runner.
 *   node scripts/migrate.js          # apply pending migrations
 *   node scripts/migrate.js --undo   # revert last migration (needs *.down.sql)
 *
 * Reads .sql files from database/migrations, applies each in a transaction,
 * and records the filename in schema_migrations.
 */
const fs = require('fs');
const path = require('path');
const db = require('../database');
const logger = require('../utils/logger');

const MIGRATIONS_DIR = path.resolve(__dirname, '..', 'database', 'migrations');

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getApplied(query) {
  const r = await query(`SELECT filename FROM schema_migrations ORDER BY filename ASC`);
  return new Set(r.rows.map((row) => row.filename));
}

function listMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql') && !f.endsWith('.down.sql'))
    .sort();
  return files;
}

async function applyMigration(client, filename) {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filePath, 'utf8');
  await client.query('BEGIN');
  try {
    // execute full script (may contain multiple statements)
    await client.query(sql);
    await client.query(`INSERT INTO schema_migrations (filename) VALUES ($1)`, [filename]);
    await client.query('COMMIT');
    logger.info(`Applied migration: ${filename}`);
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error(`Failed migration: ${filename}`, { error: err.message });
    throw err;
  }
}

async function undoLastMigration(client) {
  const r = await client.query(`SELECT filename FROM schema_migrations ORDER BY id DESC LIMIT 1`);
  if (!r.rows.length) {
    logger.warn('No migrations to undo');
    return;
  }
  const filename = r.rows[0].filename;
  const downFile = filename.replace(/\.sql$/, '.down.sql');
  const downPath = path.join(MIGRATIONS_DIR, downFile);
  if (!fs.existsSync(downPath)) {
    logger.warn(`No down file found for ${filename} (expected ${downFile}). Nothing reverted.`);
    return;
  }
  const sql = fs.readFileSync(downPath, 'utf8');
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query(`DELETE FROM schema_migrations WHERE filename = $1`, [filename]);
    await client.query('COMMIT');
    logger.info(`Reverted migration: ${filename}`);
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error(`Failed to revert migration: ${filename}`, { error: err.message });
    throw err;
  }
}

async function main() {
  const isUndo = process.argv.includes('--undo');
  const client = await db.pool.connect();
  try {
    await ensureMigrationsTable(client);
    if (isUndo) {
      await undoLastMigration(client);
    } else {
      const applied = await getApplied((t, p) => client.query(t, p));
      const files = listMigrationFiles();
      let count = 0;
      for (const file of files) {
        if (applied.has(file)) continue;
        await applyMigration(client, file);
        count++;
      }
      if (count === 0) logger.info('No pending migrations. Database is up to date.');
      else logger.info(`Applied ${count} migration(s).`);
    }
  } finally {
    client.release();
  }
}

main()
  .then(async () => {
    await db.close();
    process.exit(0);
  })
  .catch(async (err) => {
    logger.error('Migration runner failed', { error: err.message, stack: err.stack });
    await db.close();
    process.exit(1);
  });
