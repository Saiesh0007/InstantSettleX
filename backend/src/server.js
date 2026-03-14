// src/server.js
// Server bootstrap (clean version without Redis or Blockchain)

const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const db = require('./config/database');

let server;

const start = async () => {
  try {

    // Backend simulation does not strictly require the Postgres DB.
    // Bypassing DB start.
    // await db.healthCheck();
    // logger.info('PostgreSQL connected');

    // Start Trade Orchestrator
    const orchestrator = require('./trade_orchestrator');
    const nseEngine = require('./nse_engine');
    const bseEngine = require('./bse_engine');
    orchestrator.start();

    // SSE Endpoint for Live Feed
    app.get('/api/events', (req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        // Let cors middleware handle origin or override just to be safe
        res.setHeader('Access-Control-Allow-Origin', '*'); 
        res.flushHeaders();

        const sendEvent = (type, data) => {
            res.write(`event: ${type}\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        const onNseTrade = (t) => sendEvent('nse_trade', t);
        const onBseTrade = (t) => sendEvent('bse_trade', t);
        const onArbitrage = (data) => sendEvent('arbitrage', data);
        const onSettlement = (data) => sendEvent('settlement', data);
        
        nseEngine.on('trade', onNseTrade);
        bseEngine.on('trade', onBseTrade);
        orchestrator.on('arbitrage', onArbitrage);
        orchestrator.on('settlement', onSettlement);

        req.on('close', () => {
            nseEngine.removeListener('trade', onNseTrade);
            bseEngine.removeListener('trade', onBseTrade);
            orchestrator.removeListener('arbitrage', onArbitrage);
            orchestrator.removeListener('settlement', onSettlement);
        });
    });

    // Start HTTP server
    server = app.listen(env.PORT, () => {
      logger.info(`API running on port ${env.PORT}`);
      logger.info(`Base URL: http://localhost:${env.PORT}/api/${env.API_VERSION}`);
    });

    server.on('error', (err) => {
      logger.error('Server error:', err);
      process.exit(1);
    });

  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};


// ─── Graceful Shutdown ─────────────────────────────────────────

const shutdown = async (signal) => {

  logger.info(`${signal} received — shutting down`);

  server?.close(async () => {

    logger.info('HTTP server closed');

    await db.disconnect();

    logger.info('Database disconnected');

    process.exit(0);

  });

};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason);
  process.exit(1);
});

start();