-- 015_create_migrations_meta_table.sql
-- Tracks applied migration files for the custom migrate.js runner.

CREATE TABLE IF NOT EXISTS schema_migrations (
  id              SERIAL PRIMARY KEY,
  filename        VARCHAR(255) NOT NULL UNIQUE,
  applied_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
