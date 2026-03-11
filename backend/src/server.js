// src/server.js
// Server bootstrap (clean version without Redis or Blockchain)

const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const db = require('./config/database');

let server;

const start = async () => {
  try {

    // Connect database
    await db.healthCheck();
    logger.info('PostgreSQL connected');

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