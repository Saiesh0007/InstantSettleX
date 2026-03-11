// src/routes/index.routes.js

const router = require('express').Router();
const db = require('../config/database');
const response = require('../utils/apiResponse');
const env = require('../config/env');

router.use('/trades', require('./trade.routes'));
router.use('/settlements', require('./settlement.routes'));
router.use('/portfolio', require('./portfolio.routes'));
router.use('/liquidity', require('./liquidity.routes'));

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const dbHealth = await db.healthCheck();

    const health = {
      status: 'ok',
      version: env.API_VERSION,
      timestamp: new Date().toISOString(),
      services: {
        database: { status: 'ok', ...dbHealth }
      }
    };

    return res.status(200).json(health);

  } catch (error) {
    return res.status(503).json({
      status: 'error',
      message: 'Database connection failed'
    });
  }
});

module.exports = router;