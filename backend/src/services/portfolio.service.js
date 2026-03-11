// src/services/portfolio.service.js
// Simplified portfolio service (no Redis caching)

const PortfolioModel = require('../models/portfolio.model');
const { AppError } = require('../middleware/error.middleware');

const PortfolioService = {

  /**
   * Get full portfolio with positions
   */
  async getPortfolio(userId) {

    let portfolio = await PortfolioModel.findByUserId(userId);

    if (!portfolio) {
      await PortfolioModel.findOrCreate(userId);
      portfolio = await PortfolioModel.findByUserId(userId);
    }

    return portfolio;
  },


  /**
   * Update portfolio after trade settlement
   */
  async updateOnSettlement(userId, trade) {

    const portfolio = await PortfolioModel.findOrCreate(userId);

    await PortfolioModel.upsertPosition(portfolio.id, {
      asset: trade.asset,
      quantity: trade.type === 'buy'
        ? trade.quantity
        : -trade.quantity,
      avgCost: trade.price || 0,
      currentPrice: trade.price || 0,
    });

    await PortfolioModel.recalcTotals(portfolio.id);

    return true;
  },


  /**
   * Portfolio performance history
   */
  async getPerformance(userId, days = 30) {

    if (days < 1 || days > 365) {
      throw new AppError('Days must be 1–365', 400);
    }

    return PortfolioModel.getPerformanceHistory(userId, days);
  }

};

module.exports = PortfolioService;