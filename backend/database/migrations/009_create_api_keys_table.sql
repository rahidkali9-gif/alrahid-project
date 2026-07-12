-- 009_create_api_keys_table.sql
-- API keys stored as SHA-256 hashes (raw key shown once on creation).

CREATE TABLE IF NOT EXISTS api_keys (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(120),
  key_hash        VARCHAR(255) NOT NULL UNIQUE,
  key_prefix      VARCHAR(40)  NOT NULL,
  last_used_at    TIMESTAMPTZ,
  is_revoked      BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id    ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash   ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_revoked ON api_keys(is_revoked);
