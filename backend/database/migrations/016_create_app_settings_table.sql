-- 016_create_app_settings_table.sql
-- Global app settings editable from the admin panel.

CREATE TABLE IF NOT EXISTS app_settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key             VARCHAR(120) NOT NULL UNIQUE,
  value           TEXT,
  category        VARCHAR(60) NOT NULL DEFAULT 'general',
  is_public       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_settings_key      ON app_settings(key);
CREATE INDEX IF NOT EXISTS idx_app_settings_category ON app_settings(category);
CREATE INDEX IF NOT EXISTS idx_app_settings_public   ON app_settings(is_public);

DROP TRIGGER IF EXISTS trg_app_settings_updated_at ON app_settings;
CREATE TRIGGER trg_app_settings_updated_at BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
