// src/middleware/error.middleware.js
// Global error handler and 404 catcher

const logger = require('../utils/logger');
const response = require('../utils/apiResponse');

/**
 * 404 handler — must come after all routes
 */
const notFoundHandler = (req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  return response.notFound(res, `Route ${req.method} ${req.originalUrl} not found`);
};

/**
 * Global error handler — must have 4 params (err, req, res, next)
 */
const errorHandler = (err, req, res, next) => {
  // Log full error
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    user: req.user?.id,
  });

  // PostgreSQL unique constraint violation
  if (err.code === '23505') {
    return response.conflict(res, 'Resource already exists');
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return response.badRequest(res, 'Referenced resource does not exist');
  }

  // PostgreSQL not null violation
  if (err.code === '23502') {
    return response.badRequest(res, `Required field missing: ${err.column}`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return response.unauthorized(res, 'Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    return response.unauthorized(res, 'Token expired');
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return response.badRequest(res, err.message);
  }

  // Blockchain errors
  if (err.code === 'INSUFFICIENT_FUNDS') {
    return response.badRequest(res, 'Insufficient funds for transaction');
  }
  if (err.code === 'NETWORK_ERROR') {
    return response.serviceUnavailable(res, 'Blockchain network unavailable');
  }

  // Custom app errors
  if (err.isAppError) {
    return response.error(res, err.message, err.statusCode);
  }

  // Default
  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;

  return response.error(res, message, statusCode);
};

/**
 * Custom application error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isAppError = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { notFoundHandler, errorHandler, AppError };