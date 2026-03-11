// src/jobs/liquidity.monitor.js
// Monitors liquidity pools from DB and alerts on low liquidity / high utilization

const { query } = require('../config/database');
const { publish } = require('../config/redis');
const logger = require('../utils/logger');
const env = require('../config/env');

let monitorInterval = null;

const checkPools = async () => {
  try {
    const { rows: pools } = await query(
      `SELECT
         id, name, base_asset, quote_asset, chain,
         total_liquidity, available_liquidity, utilized_liquidity,
         CASE WHEN total_liquidity > 0
              THEN ROUND((utilized_liquidity / total_liquidity) * 100, 2)
              ELSE 0
         END AS utilization_pct
       FROM liquidity_pools
       WHERE is_active = true
       ORDER BY total_liquidity DESC`
    );

    if (!pools.length) {
      logger.debug('Liquidity monitor: no active pools found');
      return;
    }

    for (const pool of pools) {
      const utilPct    = parseFloat(pool.utilization_pct);
      const available  = parseFloat(pool.available_liquidity);
      const minThreshold = env.liquidity?.minThreshold || 10000;

      if (available < minThreshold) {
        logger.warn(`LOW LIQUIDITY: Pool "${pool.name}" — available: $${available.toLocaleString()}`);
        await publish('alerts', {
          type: 'LOW_LIQUIDITY', poolId: pool.id, poolName: pool.name,
          available, threshold: minThreshold, timestamp: new Date().toISOString(),
        });
      }

      if (utilPct > 90) {
        logger.warn(`HIGH UTILIZATION: Pool "${pool.name}" — ${utilPct}% utilized`);
        await publish('alerts', {
          type: 'HIGH_UTILIZATION', poolId: pool.id, poolName: pool.name,
          utilization: utilPct, timestamp: new Date().toISOString(),
        });
      }

      logger.debug(`Pool "${pool.name}": $${available.toLocaleString()} available, ${utilPct}% utilized`);
    }

    logger.info(`Liquidity monitor: checked ${pools.length} pools`);
  } catch (err) {
    logger.error('Liquidity monitor error:', err.message);
  }
};

const startLiquidityMonitor = () => {
  const intervalMs = env.liquidity?.checkIntervalMs || 30000;
  logger.info(`Liquidity monitor started (interval: ${intervalMs}ms)`);
  checkPools(); // run immediately on start
  monitorInterval = setInterval(checkPools, intervalMs);
};

const stopLiquidityMonitor = () => {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
    logger.info('Liquidity monitor stopped');
  }
};

module.exports = { startLiquidityMonitor, stopLiquidityMonitor };