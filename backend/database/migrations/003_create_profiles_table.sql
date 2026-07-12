-- 003_create_profiles_table.sql
-- Extended user profile (1:1 with users, cascade delete).

CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  first_name      VARCHAR(120),
  last_name       VARCHAR(120),
  phone           VARCHAR(40),
  bio             TEXT,
  address         VARCHAR(255),
  city            VARCHAR(120),
  country         VARCHAR(120),
  website         VARCHAR(255),
  birth_date      DATE,
  gender          VARCHAR(20),
  job_title       VARCHAR(120),
  company         VARCHAR(120),
  preferences     JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
