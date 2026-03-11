// src/jobs/settlement.worker.js
// Periodic settlement batch processor with interval-based scheduling

const SettlementEngine = require('../services/settlement.engine');
const logger = require('../utils/logger');
const env = require('../config/env');

let workerInterval = null;
let isRunning = false;

const runBatch = async () => {
  if (isRunning) {
    logger.debug('Settlement worker already running, skipping cycle');
    return;
  }

  isRunning = true;
  try {
    const result = await SettlementEngine.processBatch();
    if (result.processed > 0) {
      logger.info(`Settlement worker: ${result.succeeded}/${result.processed} settled`);
    }
  } catch (err) {
    logger.error('Settlement worker error:', err.message);
  } finally {
    isRunning = false;
  }
};

const startSettlementWorker = () => {
  logger.info(`Settlement worker started (interval: ${env.settlement.intervalMs}ms)`);
  workerInterval = setInterval(runBatch, env.settlement.intervalMs);

  // Run immediately on start
  runBatch();
};

const stopSettlementWorker = () => {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    logger.info('Settlement worker stopped');
  }
};

module.exports = { startSettlementWorker, stopSettlementWorker };