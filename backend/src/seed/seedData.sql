-- database/seed/seedData.sql

-- Users
INSERT INTO users (id, email, password_hash, wallet_address, role) VALUES
('a0000000-0000-0000-0000-000000000001','admin@instantsettlex.io',
'$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6I2V3R7gGK',
'0x1111111111111111111111111111111111111111','admin'),

('b0000000-0000-0000-0000-000000000002','trader1@example.com',
'$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6I2V3R7gGK',
'0x2222222222222222222222222222222222222222','user'),

('c0000000-0000-0000-0000-000000000003','trader2@example.com',
'$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6I2V3R7gGK',
'0x3333333333333333333333333333333333333333','user')
ON CONFLICT DO NOTHING;


-- Liquidity pools
INSERT INTO liquidity_pools (id,name,contract_address,chain_id,status,total_liquidity,available_liquidity,utilization_rate,apy,fee_rate) VALUES
('10000000-0000-0000-0000-000000000001','ETH/USDC Primary Pool','0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',1,'active',5000000,3500000,0.3000,8.5,0.003),
('10000000-0000-0000-0000-000000000002','BTC/USDT Pool','0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',1,'active',10000000,6000000,0.4000,6.2,0.003),
('10000000-0000-0000-0000-000000000003','MATIC/ETH Pool','0xcccccccccccccccccccccccccccccccccccccccc',137,'active',1000000,900000,0.1000,12.0,0.002)
ON CONFLICT DO NOTHING;


-- Trades
INSERT INTO trades (user_id,asset,type,order_type,quantity,price,status,settled_at) VALUES
('b0000000-0000-0000-0000-000000000002','ETH','buy','market',1.5,3200.00,'settled',NOW()-INTERVAL '2 hours'),
('b0000000-0000-0000-0000-000000000002','BTC','sell','limit',0.1,65000.00,'settled',NOW()-INTERVAL '1 hour'),
('c0000000-0000-0000-0000-000000000003','MATIC','buy','market',1000.0,0.85,'settled',NOW()-INTERVAL '30 minutes'),
('c0000000-0000-0000-0000-000000000003','ETH','buy','market',0.5,3250.00,'pending',NULL)
ON CONFLICT DO NOTHING;


-- Portfolios
INSERT INTO portfolios (user_id,total_value,total_pnl) VALUES
('b0000000-0000-0000-0000-000000000002',112500.00,7500.00),
('c0000000-0000-0000-0000-000000000003',3475.00,225.00)
ON CONFLICT DO NOTHING;