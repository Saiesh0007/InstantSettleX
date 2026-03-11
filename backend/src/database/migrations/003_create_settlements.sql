-- database/migrations/003_create_settlements.sql

CREATE TABLE IF NOT EXISTS settlements (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade_id            UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
    type                VARCHAR(20) NOT NULL DEFAULT 'instant'
                            CHECK (type IN ('instant','batch','cross_chain')),
    from_address        VARCHAR(42),
    to_address          VARCHAR(42),
    amount              NUMERIC(28, 18) NOT NULL,
    asset               VARCHAR(20) NOT NULL,
    chain_id            INTEGER NOT NULL DEFAULT 1,
    status              VARCHAR(20) NOT NULL DEFAULT 'queued'
                            CHECK (status IN ('queued','processing','confirmed','failed','retrying')),
    tx_hash             VARCHAR(66) UNIQUE,
    block_number        BIGINT,
    gas_estimate        VARCHAR(30),
    gas_used            VARCHAR(30),
    effective_gas_price VARCHAR(30),
    failure_reason      TEXT,
    retry_count         INTEGER NOT NULL DEFAULT 0,
    submitted_at        TIMESTAMPTZ,
    confirmed_at        TIMESTAMPTZ,
    metadata            JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_settlements_trade_id ON settlements(trade_id);
CREATE INDEX idx_settlements_status ON settlements(status);
CREATE INDEX idx_settlements_tx_hash ON settlements(tx_hash) WHERE tx_hash IS NOT NULL;
CREATE INDEX idx_settlements_queued ON settlements(status, created_at)
    WHERE status IN ('queued', 'retrying');
CREATE INDEX idx_settlements_confirmed_at ON settlements(confirmed_at DESC)
    WHERE confirmed_at IS NOT NULL;

CREATE TRIGGER set_settlements_updated_at
  BEFORE UPDATE ON settlements
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();