// src/routes/trade.routes.js

const router = require('express').Router();
const TradeController = require('../controllers/trade.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { createTradeSchema, getTradesSchema, tradeIdSchema } = require('../validators/trade.validator');

router.use(authenticate);

router.post('/', validate(createTradeSchema), TradeController.createTrade);
router.get('/', validate(getTradesSchema), TradeController.getTrades);
router.get('/stats', TradeController.getStats);
router.get('/:tradeId', validate(tradeIdSchema), TradeController.getTrade);
router.delete('/:tradeId', validate(tradeIdSchema), TradeController.cancelTrade);

module.exports = router;