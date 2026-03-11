// src/services/settlement.engine.js
// Simplified settlement engine (no Redis, no Blockchain)

const SettlementModel = require('../models/settlement.model');
const TradeModel = require('../models/trade.model');
const logger = require('../utils/logger');
const { SETTLEMENT_STATUS, TRADE_STATUS } = require('../utils/constants');

const SettlementEngine = {

  async queueSettlement(trade) {

    const settlement = await SettlementModel.create({
      tradeId: trade.id,
      type: 'instant',
      amount: trade.quantity * (trade.price || 1),
      asset: trade.asset
    });

    await TradeModel.updateStatus(trade.id, TRADE_STATUS.SETTLING);

    logger.info(`Settlement queued: ${settlement.id}`);

    return {
      queued: true,
      settlementId: settlement.id
    };
  },


  async processSettlement(settlementId) {

    try {

      const settlement = await SettlementModel.findById(settlementId);

      if (!settlement) {
        throw new Error("Settlement not found");
      }

      // Mark settlement as completed
      await SettlementModel.updateStatus(settlementId, SETTLEMENT_STATUS.COMPLETED);

      await TradeModel.updateStatus(
        settlement.trade_id,
        TRADE_STATUS.SETTLED,
        { settledAt: new Date() }
      );

      logger.info(`Settlement completed: ${settlementId}`);

      return { success: true };

    } catch (err) {

      logger.error(`Settlement failed: ${settlementId}`, err);

      await SettlementModel.updateStatus(
        settlementId,
        SETTLEMENT_STATUS.FAILED
      );

      return {
        success: false,
        error: err.message
      };
    }
  },


  async processBatch() {

    const pending = await SettlementModel.findQueued(20);

    if (!pending.length) {
      return { processed: 0 };
    }

    for (const settlement of pending) {
      await this.processSettlement(settlement.id);
    }

    return {
      processed: pending.length
    };
  },

};

module.exports = SettlementEngine;