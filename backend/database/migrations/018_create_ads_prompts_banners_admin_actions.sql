-- 018_create_ads_prompts_banners_admin_actions.sql

-- Ads (prepared for future ad placements)
CREATE TABLE IF NOT EXISTS ads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  placement       VARCHAR(60) NOT NULL,
  title           VARCHAR(200),
  content         TEXT,
  image_url       VARCHAR(500),
  target_url      VARCHAR(500),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  impressions     BIGINT NOT NULL DEFAULT 0,
  clicks          BIGINT NOT NULL DEFAULT 0,
  start_date      TIMESTAMPTZ,
  end_date        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ads_placement ON ads(placement);
CREATE INDEX IF NOT EXISTS idx_ads_active    ON ads(is_active);

DROP TRIGGER IF EXISTS trg_ads_updated_at ON ads;
CREATE TRIGGER trg_ads_updated_at BEFORE UPDATE ON ads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Prompts (prompt manager)
CREATE TABLE IF NOT EXISTS prompts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(120) NOT NULL,
  type            VARCHAR(30) NOT NULL,
  system_prompt   TEXT,
  user_template   TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompts_type    ON prompts(type);
CREATE INDEX IF NOT EXISTS idx_prompts_active  ON prompts(is_active);

DROP TRIGGER IF EXISTS trg_prompts_updated_at ON prompts;
CREATE TRIGGER trg_prompts_updated_at BEFORE UPDATE ON prompts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Banners (banner manager)
CREATE TABLE IF NOT EXISTS banners (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           VARCHAR(200) NOT NULL,
  image_url       VARCHAR(500),
  target_url      VARCHAR(500),
  position        VARCHAR(60) NOT NULL DEFAULT 'home_top',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  start_date      TIMESTAMPTZ,
  end_date        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);
CREATE INDEX IF NOT EXISTS idx_banners_active   ON banners(is_active);

DROP TRIGGER IF EXISTS trg_banners_updated_at ON banners;
CREATE TRIGGER trg_banners_updated_at BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Admin action audit log
CREATE TABLE IF NOT EXISTS admin_actions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action          VARCHAR(120) NOT NULL,
  resource        VARCHAR(120),
  resource_id     VARCHAR(120),
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id  ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action    ON admin_actions(action);
CREATE INDEX IF NOT EXISTS idx_admin_actions_resource  ON admin_actions(resource);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created   ON admin_actions(created_at DESC);
