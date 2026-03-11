// src/controllers/liquidity.controller.js

const LiquidityService = require('../services/liquidity.service');
const response = require('../utils/apiResponse');

const LiquidityController = {
  async getPools(req, res, next) {
    try {
      const { page, limit, sortBy, sortOrder, ...filters } = req.query;
      const { pools, total } = await LiquidityService.getPools({ ...filters, page, limit, sortBy, sortOrder });
      return response.paginated(res, pools, { page, limit, total });
    } catch (err) { next(err); }
  },

  async getPool(req, res, next) {
    try {
      const pool = await LiquidityService.getPool(req.params.poolId);
      return response.success(res, pool);
    } catch (err) { next(err); }
  },

  async addLiquidity(req, res, next) {
    try {
      const result = await LiquidityService.addLiquidity(req.user.id, req.body);
      return response.created(res, result, 'Liquidity added successfully');
    } catch (err) { next(err); }
  },

  async removeLiquidity(req, res, next) {
    try {
      const result = await LiquidityService.removeLiquidity(req.user.id, req.body);
      return response.success(res, result, 'Liquidity removed successfully');
    } catch (err) { next(err); }
  },

  async getStats(req, res, next) {
    try {
      const stats = await LiquidityService.getAggregateStats();
      return response.success(res, stats);
    } catch (err) { next(err); }
  },
};

module.exports = LiquidityController;