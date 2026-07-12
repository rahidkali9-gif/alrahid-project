-- 008_create_activity_logs_table.sql

CREATE TABLE IF NOT EXISTS activity_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  category        VARCHAR(60) NOT NULL,
  action          VARCHAR(120) NOT NULL,
  method          VARCHAR(10),
  path            VARCHAR(500),
  status_code     INTEGER,
  ip_address      VARCHAR(64),
  user_agent      VARCHAR(500),
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  duration_ms     INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id   ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_category  ON activity_logs(category);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action    ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created   ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_path      ON activity_logs(path);
