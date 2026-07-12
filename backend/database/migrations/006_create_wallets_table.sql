-- 006_create_wallets_table.sql
-- Per-user wallet with BIGINT balance (credits) and currency.

CREATE TABLE IF NOT EXISTS wallets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance         BIGINT NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency        VARCHAR(10) NOT NULL DEFAULT 'credits',
  version         INTEGER NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_balance ON wallets(balance);
