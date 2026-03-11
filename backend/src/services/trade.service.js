// src/services/trade.service.js

const TradeModel = require('../models/trade.model');
const SettlementEngine = require('./settlement.engine');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/error.middleware');

const TradeService = {

  // Create trade and queue settlement
  async createTrade(userId, tradeData) {

    const trade = await TradeModel.create({
      userId,
      ...tradeData
    });

    logger.info(`Trade created: ${trade.id} by user ${userId}`);

    // queue settlement
    setImmediate(() =>
      SettlementEngine.queueSettlement(trade).catch(err =>
        logger.error(`Failed to queue settlement for ${trade.id}`, err)
      )
    );

    return trade;
  },


  // Get single trade
  async getTrade(tradeId, userId) {

    const trade = await TradeModel.findById(tradeId, userId);

    if (!trade) {
      throw new AppError('Trade not found', 404);
    }

    return trade;
  },


  // Trade history
  async getTradeHistory(userId, filters) {

    return TradeModel.findMany({
      userId,
      ...filters
    });
  },


  // Cancel trade
  async cancelTrade(tradeId, userId) {

    const trade = await TradeModel.findById(tradeId, userId);

    if (!trade) {
      throw new AppError('Trade not found', 404);
    }

    if (!['pending'].includes(trade.status)) {
      throw new AppError(`Cannot cancel trade with status: ${trade.status}`, 409);
    }

    return TradeModel.updateStatus(tradeId, 'cancelled');
  },


  // Trade statistics (no cache)
  async getTradeStats(userId) {

    return TradeModel.getStats(userId);
  },


  // Admin
  async getAllTrades(filters) {

    return TradeModel.findMany(filters);
  }

};

module.exports = TradeService;