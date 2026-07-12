-- 012_create_uploads_table.sql
-- Upload metadata. category must be one of the supported types.

CREATE TABLE IF NOT EXISTS uploads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename        VARCHAR(255) NOT NULL,
  original_name   VARCHAR(255),
  mime_type       VARCHAR(120),
  size_bytes      BIGINT NOT NULL DEFAULT 0,
  category        VARCHAR(30) NOT NULL
                  CHECK (category IN ('image','video','audio','pdf','document','misc')),
  url             VARCHAR(500) NOT NULL,
  path            VARCHAR(500) NOT NULL,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_uploads_user_id   ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_category  ON uploads(category);
CREATE INDEX IF NOT EXISTS idx_uploads_created   ON uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_uploads_mime      ON uploads(mime_type);
