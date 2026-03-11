// src/controllers/portfolio.controller.js

const PortfolioService = require('../services/portfolio.service');
const response = require('../utils/apiResponse');

const PortfolioController = {
  async getPortfolio(req, res, next) {
    try {
      const portfolio = await PortfolioService.getPortfolio(req.user.id);
      return response.success(res, portfolio);
    } catch (err) { next(err); }
  },

  async getPerformance(req, res, next) {
    try {
      const days = parseInt(req.query.days) || 30;
      const history = await PortfolioService.getPerformance(req.user.id, days);
      return response.success(res, history);
    } catch (err) { next(err); }
  },
};

module.exports = PortfolioController;