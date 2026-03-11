// src/config/env.js
// Central environment configuration with validation

require('dotenv').config();

const required = (key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return process.env[key];
};

const optional = (key, defaultValue) => process.env[key] || defaultValue;

const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '3000')),
  API_VERSION: optional('API_VERSION', 'v1'),
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',

  db: {
    host: optional('DB_HOST', 'localhost'),
    port: parseInt(optional('DB_PORT', '5432')),
    name: optional('DB_NAME', 'instantsettlex'),
    user: optional('DB_USER', 'postgres'),
    password: optional('DB_PASSWORD', ''),
    poolMax: parseInt(optional('DB_POOL_MAX', '20')),
    poolMin: parseInt(optional('DB_POOL_MIN', '2')),
    poolIdle: parseInt(optional('DB_POOL_IDLE', '10000')),
  },

  redis: {
    host: optional('REDIS_HOST', 'localhost'),
    port: parseInt(optional('REDIS_PORT', '6379')),
    password: optional('REDIS_PASSWORD', ''),
    tls: optional('REDIS_TLS', 'false') === 'true',
  },

  jwt: {
    secret: optional('JWT_SECRET', 'dev_jwt_secret_change_in_prod'),
    expiresIn: optional('JWT_EXPIRES_IN', '7d'),
    refreshSecret: optional('JWT_REFRESH_SECRET', 'dev_refresh_secret'),
    refreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '30d'),
  },

  blockchain: {
    rpcUrl: optional('BLOCKCHAIN_RPC_URL', ''),
    wsUrl: optional('BLOCKCHAIN_WS_URL', ''),
    settlementContract: optional('SETTLEMENT_CONTRACT_ADDRESS', ''),
    liquidityPoolAddress: optional('LIQUIDITY_POOL_ADDRESS', ''),
    operatorPrivateKey: optional('OPERATOR_PRIVATE_KEY', ''),
    chainId: parseInt(optional('CHAIN_ID', '1')),
  },

  rateLimit: {
    windowMs: parseInt(optional('RATE_LIMIT_WINDOW_MS', '900000')),
    max: parseInt(optional('RATE_LIMIT_MAX', '100')),
  },

  logging: {
    level: optional('LOG_LEVEL', 'info'),
    dir: optional('LOG_DIR', './logs'),
  },

  settlement: {
    batchSize: parseInt(optional('SETTLEMENT_BATCH_SIZE', '50')),
    intervalMs: parseInt(optional('SETTLEMENT_INTERVAL_MS', '5000')),
    minAmount: parseFloat(optional('MIN_SETTLEMENT_AMOUNT', '0.001')),
    maxRetries: parseInt(optional('MAX_SETTLEMENT_RETRIES', '3')),
  },

  liquidity: {
    checkIntervalMs: parseInt(optional('LIQUIDITY_CHECK_INTERVAL_MS', '30000')),
    minThreshold: parseFloat(optional('MIN_LIQUIDITY_THRESHOLD', '10000')),
  },

  cors: {
    origins: optional('CORS_ORIGINS', 'http://localhost:5173').split(','),
  },
};

module.exports = env;