-- database/migrations/002_create_trades.sql

CREATE TABLE IF NOT EXISTS trades (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset           VARCHAR(20) NOT NULL,
    type            VARCHAR(10) NOT NULL CHECK (type IN ('buy', 'sell')),
    order_type      VARCHAR(20) NOT NULL DEFAULT 'market',
    quantity        NUMERIC(28, 8) NOT NULL CHECK (quantity > 0),
    price           NUMERIC(28, 8),
    stop_price      NUMERIC(28, 8),
    slippage        NUMERIC(5, 2) DEFAULT 0.5,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','matched','settling','settled','failed','cancelled')),
    from_address    VARCHAR(42),
    to_address      VARCHAR(42),
    tx_hash         VARCHAR(66) UNIQUE,
    failure_reason  TEXT,
    expires_at      TIMESTAMPTZ,
    settled_at      TIMESTAMPTZ,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_asset ON trades(asset);
CREATE INDEX idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX idx_trades_pending ON trades(status, created_at) WHERE status = 'pending';
CREATE INDEX idx_trades_tx_hash ON trades(tx_hash) WHERE tx_hash IS NOT NULL;

CREATE TRIGGER set_trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();