// src/models/liquidityPool.model.js

const db = require('../config/database');

const LiquidityPoolModel = {
  /**
   * Find pool by ID
   */
  async findById(poolId) {
    const { rows } = await db.query(
      'SELECT * FROM liquidity_pools WHERE id = $1',
      [poolId]
    );
    return rows[0] || null;
  },

  /**
   * Find all pools with optional filters
   */
  async findMany({ status, minLiquidity, sortBy = 'total_liquidity', sortOrder = 'DESC', page = 1, limit = 10 }) {
    const conditions = ['1=1'];
    const params = [];
    let i = 1;

    if (status) { conditions.push(`status = $${i++}`); params.push(status); }
    if (minLiquidity) { conditions.push(`total_liquidity >= $${i++}`); params.push(minLiquidity); }

    const where = conditions.join(' AND ');
    const validColumns = { totalLiquidity: 'total_liquidity', utilizationRate: 'utilization_rate', apy: 'apy', createdAt: 'created_at' };
    const col = validColumns[sortBy] || 'total_liquidity';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const [{ rows }, countResult] = await Promise.all([
      db.query(`SELECT * FROM liquidity_pools WHERE ${where} ORDER BY ${col} ${order} LIMIT $${i++} OFFSET $${i}`, [...params, limit, offset]),
      db.query(`SELECT COUNT(*) FROM liquidity_pools WHERE ${where}`, params),
    ]);

    return { pools: rows, total: parseInt(countResult.rows[0].count) };
  },

  /**
   * Update pool liquidity and utilization
   */
  async updateLiquidity(poolId, { totalLiquidity, availableLiquidity, utilizationRate, apy }) {
    const { rows } = await db.query(
      `UPDATE liquidity_pools
       SET total_liquidity = $2,
           available_liquidity = $3,
           utilization_rate = $4,
           apy = $5,
           last_synced_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [poolId, totalLiquidity, availableLiquidity, utilizationRate, apy]
    );
    return rows[0];
  },

  /**
   * Get provider positions in a pool
   */
  async getProviderPosition(poolId, userId) {
    const { rows } = await db.query(
      `SELECT lp.*, u.email
       FROM liquidity_positions lp
       JOIN users u ON lp.user_id = u.id
       WHERE lp.pool_id = $1 AND lp.user_id = $2`,
      [poolId, userId]
    );
    return rows[0] || null;
  },

  /**
   * Upsert a provider's liquidity position
   */
  async upsertPosition(poolId, userId, amount, operation = 'add') {
    const sign = operation === 'add' ? '+' : '-';
    const { rows } = await db.query(
      `INSERT INTO liquidity_positions (pool_id, user_id, amount)
       VALUES ($1, $2, $3)
       ON CONFLICT (pool_id, user_id) DO UPDATE
         SET amount = liquidity_positions.amount ${sign} $3,
             updated_at = NOW()
       RETURNING *`,
      [poolId, userId, amount]
    );
    return rows[0];
  },

  /**
   * Get aggregate liquidity stats
   */
  async getAggregateStats() {
    const { rows } = await db.query(
      `SELECT
         COUNT(*) AS total_pools,
         COUNT(*) FILTER (WHERE status = 'active') AS active_pools,
         COALESCE(SUM(total_liquidity), 0) AS total_tvl,
         COALESCE(SUM(available_liquidity), 0) AS total_available,
         AVG(utilization_rate) AS avg_utilization,
         AVG(apy) AS avg_apy
       FROM liquidity_pools`
    );
    return rows[0];
  },
};

module.exports = LiquidityPoolModel;