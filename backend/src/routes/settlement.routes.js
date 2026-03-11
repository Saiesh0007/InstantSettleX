// src/routes/settlement.routes.js

const router = require('express').Router();
const SettlementController = require('../controllers/settlement.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/metrics', SettlementController.getMetrics);
router.get('/:settlementId', SettlementController.getSettlement);
router.get('/trade/:tradeId', SettlementController.getSettlementsByTrade);

// Admin only
router.post('/batch', requireRole('admin'), SettlementController.triggerBatch);

module.exports = router;