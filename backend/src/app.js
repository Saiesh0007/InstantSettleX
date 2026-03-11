// src/app.js
// Express application factory

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const logger = require('./utils/logger');
const routes = require('./routes/index.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/v1/health', async (req, res) => {
  const { pool } = require('./config/database');
  const { redis } = require('./config/redis');
  let dbOk = false, redisOk = false;

  try { await pool.query('SELECT 1'); dbOk = true; } catch {}
  try { await redis.ping(); redisOk = true; } catch {}

  const status = dbOk && redisOk ? 200 : 503;
  res.status(status).json({
    status: status === 200 ? 'healthy' : 'degraded',
    services: {
      database:   dbOk    ? 'up' : 'down',
      redis:      redisOk ? 'up' : 'down',
      blockchain: 'not configured',
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use(`/api/${env.API_VERSION}`, routes);

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.isDevelopment ? '*' : (origin, cb) => {
    if (!origin || env.cors.origins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// ─── Rate limiting ─────────────────────────────────────────────────────────────
app.use(rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
}));

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(compression());

// ─── Logging ──────────────────────────────────────────────────────────────────
if (env.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.url === '/api/v1/health',
  }));
}

// ─── Request ID ───────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  req.requestId = req.headers['x-request-id'] || require('crypto').randomUUID();
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use(`/api/${env.API_VERSION}`, routes);

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;