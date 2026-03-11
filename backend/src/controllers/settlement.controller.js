// src/controllers/settlement.controller.js

const SettlementEngine = require('../services/settlement.engine');
const SettlementModel = require('../models/settlement.model');
const response = require('../utils/apiResponse');
const { AppError } = require('../middleware/error.middleware');

const SettlementController = {
  async getSettlement(req, res, next) {
    try {
      const settlement = await SettlementModel.findById(req.params.settlementId);
      if (!settlement) throw new AppError('Settlement not found', 404);
      return response.success(res, settlement);
    } catch (err) { next(err); }
  },

  async getSettlementsByTrade(req, res, next) {
    try {
      const settlements = await SettlementModel.findByTradeId(req.params.tradeId);
      return response.success(res, settlements);
    } catch (err) { next(err); }
  },

  async getMetrics(req, res, next) {
    try {
      const metrics = await SettlementEngine.getMetrics();
      return response.success(res, metrics);
    } catch (err) { next(err); }
  },

  // Admin: trigger manual batch processing
  async triggerBatch(req, res, next) {
    try {
      const result = await SettlementEngine.processBatch();
      return response.success(res, result, 'Batch processing triggered');
    } catch (err) { next(err); }
  },
};

module.exports = SettlementController;