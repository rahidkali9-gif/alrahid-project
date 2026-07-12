-- 002_create_users_table.sql
-- Core users table with role check, password reset fields, refresh token.

CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  role            VARCHAR(20)  NOT NULL DEFAULT 'user'
                  CHECK (role IN ('user','admin','super_admin')),
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  last_login_at   TIMESTAMPTZ,
  refresh_token   VARCHAR(1000),
  reset_token     VARCHAR(255),
  reset_token_expires_at TIMESTAMPTZ,
  avatar_url      VARCHAR(500),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role        ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active   ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token) WHERE reset_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_refresh_token ON users(refresh_token) WHERE refresh_token IS NOT NULL;
