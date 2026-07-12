-- 017_create_feature_toggles_and_ai_provider_settings.sql

-- Feature toggles
CREATE TABLE IF NOT EXISTS feature_toggles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_key     VARCHAR(120) NOT NULL UNIQUE,
  is_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  description     VARCHAR(255),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_toggles_key      ON feature_toggles(feature_key);
CREATE INDEX IF NOT EXISTS idx_feature_toggles_enabled  ON feature_toggles(is_enabled);

DROP TRIGGER IF EXISTS trg_feature_toggles_updated_at ON feature_toggles;
CREATE TRIGGER trg_feature_toggles_updated_at BEFORE UPDATE ON feature_toggles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- AI provider settings (stored in DB, editable from admin panel).
-- api_key_encrypted is AES-256-CBC encrypted by the application.
CREATE TABLE IF NOT EXISTS ai_provider_settings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider            VARCHAR(60) NOT NULL UNIQUE,
  api_base_url        VARCHAR(255) NOT NULL,
  api_key_encrypted   TEXT,
  default_model       VARCHAR(120),
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  config              JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_provider_settings_provider ON ai_provider_settings(provider);
CREATE INDEX IF NOT EXISTS idx_ai_provider_settings_active   ON ai_provider_settings(is_active);

DROP TRIGGER IF EXISTS trg_ai_provider_settings_updated_at ON ai_provider_settings;
CREATE TRIGGER trg_ai_provider_settings_updated_at BEFORE UPDATE ON ai_provider_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
