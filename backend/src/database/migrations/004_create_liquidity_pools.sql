-- database/migrations/004_create_liquidity_pools.sql

CREATE TABLE IF NOT EXISTS liquidity_pools (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(100) NOT NULL,
    contract_address    VARCHAR(42) UNIQUE,
    token_address       VARCHAR(42),
    chain_id            INTEGER NOT NULL DEFAULT 1,
    status              VARCHAR(20) NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active','inactive','paused','drained')),
    total_liquidity     NUMERIC(28, 18) NOT NULL DEFAULT 0,
    available_liquidity NUMERIC(28, 18) NOT NULL DEFAULT 0,
    utilization_rate    NUMERIC(5, 4) NOT NULL DEFAULT 0,
    apy                 NUMERIC(8, 4) DEFAULT 0,
    fee_rate            NUMERIC(6, 4) DEFAULT 0.003,
    last_synced_at      TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS liquidity_positions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_id     UUID NOT NULL REFERENCES liquidity_pools(id),
    user_id     UUID NOT NULL REFERENCES users(id),
    amount      NUMERIC(28, 18) NOT NULL DEFAULT 0 CHECK (amount >= 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (pool_id, user_id)
);

CREATE TABLE IF NOT EXISTS portfolios (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL UNIQUE REFERENCES users(id),
    total_value NUMERIC(28, 8) DEFAULT 0,
    total_pnl   NUMERIC(28, 8) DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_positions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id    UUID NOT NULL REFERENCES portfolios(id),
    asset           VARCHAR(20) NOT NULL,
    quantity        NUMERIC(28, 8) NOT NULL DEFAULT 0,
    avg_cost        NUMERIC(28, 8) DEFAULT 0,
    current_price   NUMERIC(28, 8) DEFAULT 0,
    value           NUMERIC(28, 8) DEFAULT 0,
    pnl             NUMERIC(28, 8) DEFAULT 0,
    pnl_percent     NUMERIC(10, 4) DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (portfolio_id, asset)
);

-- Indexes
CREATE INDEX idx_lp_status ON liquidity_pools(status);
CREATE INDEX idx_lp_total ON liquidity_pools(total_liquidity DESC);
CREATE INDEX idx_positions_user ON liquidity_positions(user_id);
CREATE INDEX idx_portfolio_user ON portfolios(user_id);
CREATE INDEX idx_pp_portfolio ON portfolio_positions(portfolio_id);

-- Triggers
CREATE TRIGGER set_lp_updated_at BEFORE UPDATE ON liquidity_pools FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_positions_updated_at BEFORE UPDATE ON liquidity_positions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_portfolios_updated_at BEFORE UPDATE ON portfolios FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_pp_updated_at BEFORE UPDATE ON portfolio_positions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();