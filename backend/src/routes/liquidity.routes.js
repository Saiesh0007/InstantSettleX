// src/routes/liquidity.routes.js

const router = require('express').Router();
const LiquidityController = require('../controllers/liquidity.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { addLiquiditySchema, removeLiquiditySchema, getPoolSchema, getPoolsSchema } = require('../validators/liquidity.validator');

// Public
router.get('/stats', LiquidityController.getStats);
router.get('/', validate(getPoolsSchema), LiquidityController.getPools);
router.get('/:poolId', validate(getPoolSchema), LiquidityController.getPool);

// Authenticated
router.post('/add', authenticate, validate(addLiquiditySchema), LiquidityController.addLiquidity);
router.post('/remove', authenticate, validate(removeLiquiditySchema), LiquidityController.removeLiquidity);

module.exports = router;