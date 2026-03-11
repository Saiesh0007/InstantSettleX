// src/config/database.js
// PostgreSQL connection pool with health check and query helper

const { Pool } = require('pg');
const env = require('./env');
const logger = require('../utils/logger');

const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
  max: env.db.poolMax,
  min: env.db.poolMin,
  idleTimeoutMillis: env.db.poolIdle,
  connectionTimeoutMillis: 5000,
  ssl: env.isProduction ? { rejectUnauthorized: true } : false,
});

pool.on('connect', () => {
  logger.debug('New PostgreSQL connection established');
});

pool.on('error', (err) => {
  logger.error('PostgreSQL pool error:', err.message);
});

/**
 * Execute a parameterized query
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Query executed', { text, duration, rows: result.rowCount });
    return result;
  } catch (err) {
    logger.error('Query failed', { text, error: err.message });
    throw err;
  }
};

/**
 * Execute queries within a transaction
 * @param {Function} callback - Async function receiving a client
 */
const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Health check — verifies DB is reachable
 */
const healthCheck = async () => {
  const result = await query('SELECT NOW() as now, version() as version');
  return result.rows[0];
};

/**
 * Graceful shutdown
 */
const disconnect = async () => {
  await pool.end();
  logger.info('PostgreSQL pool closed');
};

module.exports = { query, withTransaction, healthCheck, disconnect, pool };