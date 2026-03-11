// src/routes/portfolio.routes.js

const router = require('express').Router();
const PortfolioController = require('../controllers/portfolio.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', PortfolioController.getPortfolio);
router.get('/performance', PortfolioController.getPerformance);

module.exports = router;