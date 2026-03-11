// src/validators/liquidity.validator.js

const Joi = require('joi');

const addLiquiditySchema = {
  body: Joi.object({
    poolId: Joi.string().uuid().required(),
    amount: Joi.number().positive().precision(18).required(),
    token: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).optional(),
    lockPeriodDays: Joi.number().integer().min(0).max(365).default(0),
  }),
};

const removeLiquiditySchema = {
  body: Joi.object({
    poolId: Joi.string().uuid().required(),
    amount: Joi.number().positive().precision(18).required(),
    recipient: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).optional(),
  }),
};

const getPoolSchema = {
  params: Joi.object({
    poolId: Joi.string().uuid().required(),
  }),
};

const getPoolsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    status: Joi.string().valid('active', 'inactive', 'paused', 'drained').optional(),
    minLiquidity: Joi.number().min(0).optional(),
    sortBy: Joi.string().valid('totalLiquidity', 'utilizationRate', 'apy', 'createdAt').default('totalLiquidity'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

module.exports = { addLiquiditySchema, removeLiquiditySchema, getPoolSchema, getPoolsSchema };