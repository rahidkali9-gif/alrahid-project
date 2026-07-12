-- 007_create_wallet_transactions_table.sql
-- Wallet ledger: credit/debit entries.

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id       UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            VARCHAR(10) NOT NULL CHECK (type IN ('credit','debit')),
  amount          BIGINT NOT NULL CHECK (amount > 0),
  balance_before  BIGINT NOT NULL,
  balance_after   BIGINT NOT NULL,
  reason          VARCHAR(255),
  reference_type  VARCHAR(60),
  reference_id    UUID,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wt_wallet_id   ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wt_user_id     ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wt_type        ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wt_created     ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wt_reference   ON wallet_transactions(reference_type, reference_id);
