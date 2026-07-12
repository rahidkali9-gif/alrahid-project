-- 010_create_ai_generations_table.sql
-- Records each AI generation with wallet charge and status.

CREATE TABLE IF NOT EXISTS ai_generations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            VARCHAR(30) NOT NULL
                  CHECK (type IN ('chat','image','video','voice','music','logo',
                                  'resume','presentation','pdf_summary','code',
                                  'website','app','email','document')),
  prompt          TEXT NOT NULL,
  model           VARCHAR(120),
  provider        VARCHAR(60),
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','processing','succeeded','failed','refunded')),
  result          JSONB NOT NULL DEFAULT '{}'::jsonb,
  cost            INTEGER NOT NULL DEFAULT 0,
  tokens_used     INTEGER,
  duration_ms     INTEGER,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_gen_user_id   ON ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_gen_type      ON ai_generations(type);
CREATE INDEX IF NOT EXISTS idx_ai_gen_status    ON ai_generations(status);
CREATE INDEX IF NOT EXISTS idx_ai_gen_created   ON ai_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_gen_provider  ON ai_generations(provider);
