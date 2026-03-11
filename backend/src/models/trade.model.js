// src/models/trade.model.js

const db = require('../config/database');
const { TRADE_STATUS, DEFAULT_PAGE_SIZE } = require('../utils/constants');

const TradeModel = {
  /**
   * Create a new trade
   */
  async create({ userId, asset, type, orderType, quantity, price, stopPrice, slippage, expiresAt, metadata }) {
    const { rows } = await db.query(
      `INSERT INTO trades
        (user_id, asset, type, order_type, quantity, price, stop_price, slippage, status, expires_at, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [userId, asset, type, orderType, quantity, price, stopPrice, slippage, TRADE_STATUS.PENDING, expiresAt, metadata]
    );
    return rows[0];
  },

  /**
   * Find trade by ID (scoped to user)
   */
  async findById(tradeId, userId = null) {
    const conditions = userId
      ? 'WHERE t.id = $1 AND t.user_id = $2'
      : 'WHERE t.id = $1';
    const params = userId ? [tradeId, userId] : [tradeId];

    const { rows } = await db.query(
      `SELECT t.*, u.email as user_email
       FROM trades t
       LEFT JOIN users u ON t.user_id = u.id
       ${conditions}`,
      params
    );
    return rows[0] || null;
  },

  /**
   * Find trades with filters and pagination
   */
  async findMany({ userId, status, asset, type, from, to, sortBy = 'created_at', sortOrder = 'DESC', page = 1, limit = DEFAULT_PAGE_SIZE }) {
    const conditions = ['1=1'];
    const params = [];
    let i = 1;

    if (userId) { conditions.push(`t.user_id = $${i++}`); params.push(userId); }
    if (status) { conditions.push(`t.status = $${i++}`); params.push(status); }
    if (asset) { conditions.push(`t.asset = $${i++}`); params.push(asset.toUpperCase()); }
    if (type) { conditions.push(`t.type = $${i++}`); params.push(type); }
    if (from) { conditions.push(`t.created_at >= $${i++}`); params.push(from); }
    if (to) { conditions.push(`t.created_at <= $${i++}`); params.push(to); }

    const where = conditions.join(' AND ');
    const offset = (page - 1) * limit;
    const validSortColumns = { createdAt: 'created_at', amount: 'quantity', status: 'status' };
    const sortColumn = validSortColumns[sortBy] || 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [{ rows }, countResult] = await Promise.all([
      db.query(
        `SELECT t.* FROM trades t WHERE ${where} ORDER BY t.${sortColumn} ${order} LIMIT $${i++} OFFSET $${i}`,
        [...params, limit, offset]
      ),
      db.query(`SELECT COUNT(*) FROM trades t WHERE ${where}`, params),
    ]);

    return { trades: rows, total: parseInt(countResult.rows[0].count) };
  },

  /**
   * Update trade status
   */
  async updateStatus(tradeId, status, extra = {}) {
    const updates = ['status = $2', 'updated_at = NOW()'];
    const params = [tradeId, status];
    let i = 3;

    if (extra.txHash) { updates.push(`tx_hash = $${i++}`); params.push(extra.txHash); }
    if (extra.settledAt) { updates.push(`settled_at = $${i++}`); params.push(extra.settledAt); }
    if (extra.failureReason) { updates.push(`failure_reason = $${i++}`); params.push(extra.failureReason); }

    const { rows } = await db.query(
      `UPDATE trades SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );
    return rows[0];
  },

  /**
   * Find pending trades older than a threshold (for settlement sweeper)
   */
  async findPendingForSettlement(batchSize = 50) {
    const { rows } = await db.query(
      `SELECT * FROM trades
       WHERE status = $1
         AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY created_at ASC
       LIMIT $2
       FOR UPDATE SKIP LOCKED`,
      [TRADE_STATUS.PENDING, batchSize]
    );
    return rows;
  },

  /**
   * Get trade statistics for a user
   */
  async getStats(userId) {
    const { rows } = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'settled') AS total_settled,
         COUNT(*) FILTER (WHERE status = 'pending') AS total_pending,
         COUNT(*) FILTER (WHERE status = 'failed') AS total_failed,
         COALESCE(SUM(quantity * price) FILTER (WHERE status = 'settled'), 0) AS total_volume,
         AVG(EXTRACT(EPOCH FROM (settled_at - created_at))) FILTER (WHERE settled_at IS NOT NULL) AS avg_settlement_seconds
       FROM trades
       WHERE user_id = $1`,
      [userId]
    );
    return rows[0];
  },
};

module.exports = TradeModel;