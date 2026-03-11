// src/utils/logger.js
// Winston logger with daily rotation, structured JSON output in production

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const env = require('../config/env');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const transports = [
  new winston.transports.Console({
    format: env.isProduction ? prodFormat : devFormat,
  }),
];

if (env.isProduction) {
  transports.push(
    new DailyRotateFile({
      dirname: env.logging.dir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d',
      maxSize: '20m',
      format: prodFormat,
    }),
    new DailyRotateFile({
      dirname: env.logging.dir,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '50m',
      format: prodFormat,
    })
  );
}

const logger = winston.createLogger({
  level: env.logging.level,
  transports,
  exitOnError: false,
});

module.exports = logger;