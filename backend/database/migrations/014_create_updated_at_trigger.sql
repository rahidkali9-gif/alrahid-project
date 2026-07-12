-- 014_create_updated_at_trigger.sql
-- Generic updated_at trigger function and per-table triggers.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at            ON users;
DROP TRIGGER IF EXISTS trg_profiles_updated_at         ON profiles;
DROP TRIGGER IF EXISTS trg_settings_updated_at         ON settings;
DROP TRIGGER IF EXISTS trg_notifications_updated_at    ON notifications;
DROP TRIGGER IF EXISTS trg_wallets_updated_at          ON wallets;
DROP TRIGGER IF EXISTS trg_api_keys_updated_at         ON api_keys;
DROP TRIGGER IF EXISTS trg_ai_generations_updated_at   ON ai_generations;
DROP TRIGGER IF EXISTS trg_app_settings_updated_at     ON app_settings;
DROP TRIGGER IF EXISTS trg_feature_toggles_updated_at  ON feature_toggles;
DROP TRIGGER IF EXISTS trg_ai_provider_settings_updated_at ON ai_provider_settings;
DROP TRIGGER IF EXISTS trg_ads_updated_at              ON ads;
DROP TRIGGER IF EXISTS trg_prompts_updated_at          ON prompts;
DROP TRIGGER IF EXISTS trg_banners_updated_at          ON banners;

CREATE TRIGGER trg_users_updated_at            BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_profiles_updated_at         BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_settings_updated_at         BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_notifications_updated_at    BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_wallets_updated_at          BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_api_keys_updated_at         BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_ai_generations_updated_at   BEFORE UPDATE ON ai_generations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Triggers for tables created in later migrations are created within those
-- migration files (to avoid referencing non-existent tables).
