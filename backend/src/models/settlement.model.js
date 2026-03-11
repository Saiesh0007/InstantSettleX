// src/models/settlement.model.js

const db = require('../config/database');
const { SETTLEMENT_STATUS } = require('../utils/constants');

const SettlementModel = {
  /**
   * Create a settlement record
   */
  async create({ tradeId, type, fromAddress, toAddress, amount, asset, chainId, metadata }) {
    const { rows } = await db.query(
      `INSERT INTO settlements
         (trade_id, type, from_address, to_address, amount, asset, chain_id, status, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [tradeId, type, fromAddress, toAddress, amount, asset, chainId, SETTLEMENT_STATUS.QUEUED, metadata]
    );
    return rows[0];
  },

  /**
   * Find settlement by ID
   */
  async findById(settlementId) {
    const { rows } = await db.query(
      `SELECT s.*, t.asset, t.quantity, t.user_id
       FROM settlements s
       LEFT JOIN trades t ON s.trade_id = t.id
       WHERE s.id = $1`,
      [settlementId]
    );
    return rows[0] || null;
  },

  /**
   * Find settlement by trade ID
   */
  async findByTradeId(tradeId) {
    const { rows } = await db.query(
      'SELECT * FROM settlements WHERE trade_id = $1 ORDER BY created_at DESC',
      [tradeId]
    );
    return rows;
  },

  /**
   * Update settlement after blockchain submission
   */
  async updateOnSubmit(settlementId, { txHash, gasEstimate }) {
    const { rows } = await db.query(
      `UPDATE settlements
       SET status = $2, tx_hash = $3, gas_estimate = $4, submitted_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [settlementId, SETTLEMENT_STATUS.PROCESSING, txHash, gasEstimate]
    );
    return rows[0];
  },

  /**
   * Update settlement on confirmation
   */
  async updateOnConfirm(settlementId, { blockNumber, gasUsed, effectiveGasPrice }) {
    const { rows } = await db.query(
      `UPDATE settlements
       SET status = $2, block_number = $3, gas_used = $4, effective_gas_price = $5,
           confirmed_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [settlementId, SETTLEMENT_STATUS.CONFIRMED, blockNumber, gasUsed, effectiveGasPrice]
    );
    return rows[0];
  },

  /**
   * Mark settlement failed
   */
  async updateOnFailure(settlementId, { reason, retryCount }) {
    const status = retryCount < 3 ? SETTLEMENT_STATUS.RETRYING : SETTLEMENT_STATUS.FAILED;
    const { rows } = await db.query(
      `UPDATE settlements
       SET status = $2, failure_reason = $3, retry_count = $4, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [settlementId, status, reason, retryCount]
    );
    return rows[0];
  },

  /**
   * Find queued settlements for processing
   */
  async findQueued(batchSize = 50) {
    const { rows } = await db.query(
      `SELECT * FROM settlements
       WHERE status IN ($1, $2)
       ORDER BY created_at ASC
       LIMIT $3
       FOR UPDATE SKIP LOCKED`,
      [SETTLEMENT_STATUS.QUEUED, SETTLEMENT_STATUS.RETRYING, batchSize]
    );
    return rows;
  },

  /**
   * Get settlement metrics
   */
  async getMetrics(timeWindowMinutes = 60) {
    const { rows } = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,
         COUNT(*) FILTER (WHERE status = 'failed') AS failed,
         COUNT(*) FILTER (WHERE status IN ('queued','processing','retrying')) AS pending,
         AVG(EXTRACT(EPOCH FROM (confirmed_at - created_at))) FILTER (WHERE confirmed_at IS NOT NULL) AS avg_settlement_time,
         COALESCE(SUM(amount) FILTER (WHERE status = 'confirmed'), 0) AS total_volume_settled
       FROM settlements
       WHERE created_at >= NOW() - INTERVAL '1 minute' * $1`,
      [timeWindowMinutes]
    );
    return rows[0];
  },
};

module.exports = SettlementModel;