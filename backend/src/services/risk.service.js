// src/services/risk.service.js
// Pre-settlement risk assessment: limits, velocity, exposure checks

const redis = require('../config/redis');
const db = require('../config/database');
const logger = require('../utils/logger');
const { RISK_LEVEL } = require('../utils/constants');

// Configurable thresholds
const LIMITS = {
  maxSingleTradeUSD: 1_000_000,
  maxDailyVolumeUSD: 5_000_000,
  maxPositionPercent: 0.25,        // 25% of portfolio in one asset
  suspiciousVelocity: 50,          // trades per minute
  minAmountUSD: 0.01,
};

const RiskService = {
  /**
   * Assess risk of a trade before settlement
   * Returns { blocked, score, level, reason }
   */
  async assessTrade(trade) {
    const checks = await Promise.all([
      this._checkTradeSizeLimit(trade),
      this._checkDailyVolumeLimit(trade),
      this._checkVelocity(trade.user_id),
      this._checkMinimumAmount(trade),
    ]);

    const failures = checks.filter((c) => c.blocked);
    if (failures.length) {
      return { blocked: true, score: 100, level: RISK_LEVEL.CRITICAL, reason: failures[0].reason };
    }

    const score = checks.reduce((sum, c) => sum + (c.score || 0), 0) / checks.length;
    const level =
      score >= 80 ? RISK_LEVEL.CRITICAL :
      score >= 60 ? RISK_LEVEL.HIGH :
      score >= 30 ? RISK_LEVEL.MEDIUM :
      RISK_LEVEL.LOW;

    return { blocked: false, score, level };
  },

  async _checkTradeSizeLimit(trade) {
    const value = trade.quantity * (trade.price || 1);
    if (value > LIMITS.maxSingleTradeUSD) {
      return {
        blocked: true,
        reason: `Trade size $${value.toFixed(2)} exceeds limit $${LIMITS.maxSingleTradeUSD}`,
        score: 100,
      };
    }
    const score = (value / LIMITS.maxSingleTradeUSD) * 50;
    return { blocked: false, score };
  },

  async _checkDailyVolumeLimit(trade) {
    const { rows } = await db.query(
      `SELECT COALESCE(SUM(quantity * price), 0) AS daily_volume
       FROM trades
       WHERE user_id = $1
         AND created_at >= NOW() - INTERVAL '24 hours'
         AND status NOT IN ('failed','cancelled')`,
      [trade.user_id]
    );
    const dailyVolume = parseFloat(rows[0].daily_volume);
    const tradeValue = trade.quantity * (trade.price || 1);

    if (dailyVolume + tradeValue > LIMITS.maxDailyVolumeUSD) {
      return {
        blocked: true,
        reason: `Daily volume limit exceeded: $${(dailyVolume + tradeValue).toFixed(2)}`,
        score: 100,
      };
    }
    const score = ((dailyVolume + tradeValue) / LIMITS.maxDailyVolumeUSD) * 40;
    return { blocked: false, score };
  },

  async _checkVelocity(userId) {
    const key = `velocity:${userId}`;
    const count = await redis.incr(key, 60); // 1-minute window
    if (count > LIMITS.suspiciousVelocity) {
      return {
        blocked: true,
        reason: `Suspicious trade velocity: ${count} trades/min`,
        score: 100,
      };
    }
    const score = (count / LIMITS.suspiciousVelocity) * 30;
    return { blocked: false, score };
  },

  async _checkMinimumAmount(trade) {
    const value = trade.quantity * (trade.price || 1);
    if (value < LIMITS.minAmountUSD) {
      return {
        blocked: true,
        reason: `Trade value $${value} below minimum $${LIMITS.minAmountUSD}`,
        score: 0,
      };
    }
    return { blocked: false, score: 0 };
  },

  /**
   * Get risk profile summary for a user
   */
  async getUserRiskProfile(userId) {
    const { rows } = await db.query(
      `SELECT
         COUNT(*) AS total_trades,
         COUNT(*) FILTER (WHERE status = 'failed') AS failed_trades,
         COALESCE(AVG(quantity * price), 0) AS avg_trade_size,
         COALESCE(MAX(quantity * price), 0) AS max_trade_size
       FROM trades
       WHERE user_id = $1
         AND created_at >= NOW() - INTERVAL '30 days'`,
      [userId]
    );
    return rows[0];
  },
};

module.exports = RiskService;