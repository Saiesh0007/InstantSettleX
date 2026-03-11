// src/models/portfolio.model.js

const db = require('../config/database');

const PortfolioModel = {
  /**
   * Get or create portfolio for user
   */
  async findOrCreate(userId) {
    const { rows } = await db.query(
      `INSERT INTO portfolios (user_id) VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING
       RETURNING *`,
      [userId]
    );
    if (rows[0]) return rows[0];
    const result = await db.query('SELECT * FROM portfolios WHERE user_id = $1', [userId]);
    return result.rows[0];
  },

  /**
   * Get portfolio with positions
   */
  async findByUserId(userId) {
    const { rows: portfolio } = await db.query(
      'SELECT * FROM portfolios WHERE user_id = $1',
      [userId]
    );
    if (!portfolio[0]) return null;

    const { rows: positions } = await db.query(
      `SELECT pp.*, t.asset
       FROM portfolio_positions pp
       WHERE pp.portfolio_id = $1
       ORDER BY pp.value DESC`,
      [portfolio[0].id]
    );

    return { ...portfolio[0], positions };
  },

  /**
   * Upsert a position
   */
  async upsertPosition(portfolioId, { asset, quantity, avgCost, currentPrice }) {
    const value = quantity * currentPrice;
    const pnl = (currentPrice - avgCost) * quantity;
    const pnlPercent = avgCost > 0 ? ((currentPrice - avgCost) / avgCost) * 100 : 0;

    const { rows } = await db.query(
      `INSERT INTO portfolio_positions (portfolio_id, asset, quantity, avg_cost, current_price, value, pnl, pnl_percent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (portfolio_id, asset) DO UPDATE
         SET quantity = $3,
             avg_cost = $4,
             current_price = $5,
             value = $6,
             pnl = $7,
             pnl_percent = $8,
             updated_at = NOW()
       RETURNING *`,
      [portfolioId, asset, quantity, avgCost, currentPrice, value, pnl, pnlPercent]
    );
    return rows[0];
  },

  /**
   * Recalculate portfolio totals
   */
  async recalcTotals(portfolioId) {
    const { rows } = await db.query(
      `UPDATE portfolios p
       SET total_value = agg.total_value,
           total_pnl = agg.total_pnl,
           updated_at = NOW()
       FROM (
         SELECT portfolio_id,
                SUM(value) AS total_value,
                SUM(pnl) AS total_pnl
         FROM portfolio_positions
         WHERE portfolio_id = $1
         GROUP BY portfolio_id
       ) agg
       WHERE p.id = agg.portfolio_id
       RETURNING p.*`,
      [portfolioId]
    );
    return rows[0];
  },

  /**
   * Get portfolio performance history
   */
  async getPerformanceHistory(userId, days = 30) {
    const { rows } = await db.query(
      `SELECT date_trunc('day', created_at) AS date,
              LAST(total_value, created_at) AS value
       FROM portfolio_snapshots
       WHERE user_id = $1
         AND created_at >= NOW() - INTERVAL '1 day' * $2
       GROUP BY 1
       ORDER BY 1 ASC`,
      [userId, days]
    );
    return rows;
  },
};

module.exports = PortfolioModel;