// src/services/liquidity.service.js
// Liquidity service without Redis caching

const LiquidityPoolModel = require("../models/liquidityPool.model");
const logger = require("../utils/logger");
const { AppError } = require("../middleware/error.middleware");

const LiquidityService = {
  /**
   * Get all liquidity pools
   */
  async getPools(filters) {
    return LiquidityPoolModel.findMany(filters);
  },

  /**
   * Get single pool
   */
  async getPool(poolId) {
    const pool = await LiquidityPoolModel.findById(poolId);

    if (!pool) {
      throw new AppError("Liquidity pool not found", 404);
    }

    return pool;
  },

  /**
   * Add liquidity
   */
  async addLiquidity(userId, { poolId, amount }) {
    const pool = await LiquidityPoolModel.findById(poolId);

    if (!pool) {
      throw new AppError("Pool not found", 404);
    }

    if (pool.status !== "active") {
      throw new AppError(`Pool is ${pool.status}`, 409);
    }

    const position = await LiquidityPoolModel.upsertPosition(
      poolId,
      userId,
      amount,
      "add",
    );

    logger.info(`User ${userId} added ${amount} liquidity to pool ${poolId}`);

    return position;
  },

  /**
   * Remove liquidity
   */
  async removeLiquidity(userId, { poolId, amount }) {
    const position = await LiquidityPoolModel.getProviderPosition(
      poolId,
      userId,
    );

    if (!position) {
      throw new AppError("No position in this pool", 404);
    }

    if (position.amount < amount) {
      throw new AppError("Insufficient position balance", 400);
    }

    const updated = await LiquidityPoolModel.upsertPosition(
      poolId,
      userId,
      amount,
      "remove",
    );

    logger.info(`User ${userId} removed ${amount} from pool ${poolId}`);

    return updated;
  },

  /**
   * Sync pool stats from blockchain
   */
  async syncFromChain(poolId) {
    const pool = await LiquidityPoolModel.findById(poolId);

    if (!pool) {
      throw new AppError("Pool not found", 404);
    }

    // For now just return DB stats
    return pool;
  },

  /**
   * Aggregate TVL stats
   */
  async getAggregateStats() {
    return LiquidityPoolModel.getAggregateStats();
  },
};

module.exports = LiquidityService;
