-- 011_create_history_table.sql
-- Per-user generic history of interactions (for user-facing history).

CREATE TABLE IF NOT EXISTS history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category        VARCHAR(60) NOT NULL,
  action          VARCHAR(120) NOT NULL,
  title           VARCHAR(255),
  summary         TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_user_id   ON history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_category  ON history(category);
CREATE INDEX IF NOT EXISTS idx_history_created   ON history(created_at DESC);
