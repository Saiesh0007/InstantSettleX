// src/utils/constants.js

// ─── Trade ────────────────────────────────────────────────────────────────────
const TRADE_STATUS = Object.freeze({
  PENDING: 'pending',
  MATCHED: 'matched',
  SETTLING: 'settling',
  SETTLED: 'settled',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
});

const TRADE_TYPE = Object.freeze({
  BUY: 'buy',
  SELL: 'sell',
});

const ORDER_TYPE = Object.freeze({
  MARKET: 'market',
  LIMIT: 'limit',
  STOP: 'stop',
  STOP_LIMIT: 'stop_limit',
});

// ─── Settlement ───────────────────────────────────────────────────────────────
const SETTLEMENT_STATUS = Object.freeze({
  QUEUED: 'queued',
  PROCESSING: 'processing',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  RETRYING: 'retrying',
});

const SETTLEMENT_TYPE = Object.freeze({
  INSTANT: 'instant',
  BATCH: 'batch',
  CROSS_CHAIN: 'cross_chain',
});

// ─── Liquidity ────────────────────────────────────────────────────────────────
const LIQUIDITY_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PAUSED: 'paused',
  DRAINED: 'drained',
});

// ─── Blockchain ───────────────────────────────────────────────────────────────
const TX_STATUS = Object.freeze({
  PENDING: 'pending',
  MINED: 'mined',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  DROPPED: 'dropped',
});

const CONFIRMATIONS_REQUIRED = 2;

// ─── Risk ─────────────────────────────────────────────────────────────────────
const RISK_LEVEL = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
});

// ─── Cache TTLs (seconds) ─────────────────────────────────────────────────────
const CACHE_TTL = Object.freeze({
  PORTFOLIO: 30,
  LIQUIDITY: 10,
  TRADE_HISTORY: 60,
  MARKET_DATA: 5,
  USER_PROFILE: 300,
});

// ─── Pagination ───────────────────────────────────────────────────────────────
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// ─── Queue Names ──────────────────────────────────────────────────────────────
const QUEUES = Object.freeze({
  SETTLEMENT: 'settlement-queue',
  LIQUIDITY: 'liquidity-monitor',
  NOTIFICATIONS: 'notifications',
});

// ─── Redis Key Prefixes ───────────────────────────────────────────────────────
const REDIS_KEYS = Object.freeze({
  PORTFOLIO: (userId) => `portfolio:${userId}`,
  LIQUIDITY_POOL: (poolId) => `liquidity:${poolId}`,
  RATE_LIMIT: (ip) => `rate:${ip}`,
  SESSION: (userId) => `session:${userId}`,
  SETTLEMENT_LOCK: (id) => `lock:settlement:${id}`,
});

module.exports = {
  TRADE_STATUS,
  TRADE_TYPE,
  ORDER_TYPE,
  SETTLEMENT_STATUS,
  SETTLEMENT_TYPE,
  LIQUIDITY_STATUS,
  TX_STATUS,
  CONFIRMATIONS_REQUIRED,
  RISK_LEVEL,
  CACHE_TTL,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  QUEUES,
  REDIS_KEYS,
};