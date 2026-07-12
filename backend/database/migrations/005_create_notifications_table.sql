-- 005_create_notifications_table.sql

CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(200) NOT NULL,
  message         TEXT NOT NULL,
  type            VARCHAR(20) NOT NULL DEFAULT 'info'
                  CHECK (type IN ('info','success','warning','error')),
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  link            VARCHAR(500),
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id   ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read   ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created   ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type      ON notifications(type);
