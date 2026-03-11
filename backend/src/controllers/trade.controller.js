// src/controllers/trade.controller.js

const TradeService = require('../services/trade.service');
const response = require('../utils/apiResponse');
const logger = require('../utils/logger');

const TradeController = {
  /**
   * POST /trades
   */
  async createTrade(req, res, next) {
    try {
      const trade = await TradeService.createTrade(req.user.id, req.body);
      return response.created(res, trade, 'Trade submitted for settlement');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /trades
   */
  async getTrades(req, res, next) {
    try {
      const { page, limit, sortBy, sortOrder, ...filters } = req.query;
      const { trades, total } = await TradeService.getTradeHistory(req.user.id, {
        ...filters,
        page,
        limit,
        sortBy,
        sortOrder,
      });
      return response.paginated(res, trades, { page, limit, total });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /trades/:tradeId
   */
  async getTrade(req, res, next) {
    try {
      const trade = await TradeService.getTrade(req.params.tradeId, req.user.id);
      return response.success(res, trade);
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /trades/:tradeId
   */
  async cancelTrade(req, res, next) {
    try {
      const trade = await TradeService.cancelTrade(req.params.tradeId, req.user.id);
      return response.success(res, trade, 'Trade cancelled');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /trades/stats
   */
  async getStats(req, res, next) {
    try {
      const stats = await TradeService.getTradeStats(req.user.id);
      return response.success(res, stats);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = TradeController;