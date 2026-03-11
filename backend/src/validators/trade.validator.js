// src/validators/trade.validator.js

const Joi = require('joi');
const { TRADE_TYPE, ORDER_TYPE } = require('../utils/constants');

const createTradeSchema = {
  body: Joi.object({
    asset: Joi.string().uppercase().min(2).max(20).required(),
    type: Joi.string().valid(...Object.values(TRADE_TYPE)).required(),
    orderType: Joi.string().valid(...Object.values(ORDER_TYPE)).default('market'),
    quantity: Joi.number().positive().precision(8).required(),
    price: Joi.number().positive().precision(8).when('orderType', {
      is: Joi.valid('limit', 'stop_limit'),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    stopPrice: Joi.number().positive().precision(8).when('orderType', {
      is: Joi.valid('stop', 'stop_limit'),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    slippage: Joi.number().min(0).max(50).default(0.5),
    expiresAt: Joi.date().greater('now').optional(),
    metadata: Joi.object().optional(),
  }),
};

const getTradesSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string().optional(),
    asset: Joi.string().uppercase().optional(),
    type: Joi.string().valid(...Object.values(TRADE_TYPE)).optional(),
    from: Joi.date().optional(),
    to: Joi.date().optional(),
    sortBy: Joi.string().valid('createdAt', 'amount', 'status').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

const tradeIdSchema = {
  params: Joi.object({
    tradeId: Joi.string().uuid().required(),
  }),
};

module.exports = { createTradeSchema, getTradesSchema, tradeIdSchema };