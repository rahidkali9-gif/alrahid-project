-- 013_create_password_changes_table.sql
-- Audit trail of password changes.

CREATE TABLE IF NOT EXISTS password_changes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  changed_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address      VARCHAR(64),
  user_agent      VARCHAR(500),
  reason          VARCHAR(60) NOT NULL DEFAULT 'user_change'
                  CHECK (reason IN ('user_change','admin_reset','forgot_reset')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_changes_user_id   ON password_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_password_changes_created   ON password_changes(created_at DESC);
