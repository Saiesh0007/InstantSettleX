// src/middleware/auth.middleware.js
// JWT authentication + role-based access control (no Redis)

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const response = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Verify JWT and attach user to req.user
 */
const authenticate = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.unauthorized(res, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, env.jwt.secret);

    req.user = decoded;
    req.token = token;

    next();

  } catch (err) {

    if (err.name === 'TokenExpiredError') {
      return response.unauthorized(res, 'Token expired');
    }

    if (err.name === 'JsonWebTokenError') {
      return response.unauthorized(res, 'Invalid token');
    }

    logger.error('Auth middleware error:', err);
    return response.error(res);
  }
};


/**
 * Require specific roles
 */
const requireRole = (...roles) => (req, res, next) => {

  if (!req.user) return response.unauthorized(res);

  if (!roles.includes(req.user.role)) {
    return response.forbidden(res, `Required role: ${roles.join(' or ')}`);
  }

  next();
};


/**
 * Optional auth
 */
const optionalAuth = async (req, res, next) => {

  try {

    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      req.user = jwt.verify(token, env.jwt.secret);
    }

  } catch {
    // ignore errors
  }

  next();
};


/**
 * Generate access token
 */
const generateAccessToken = (payload) =>
  jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });


/**
 * Generate refresh token
 */
const generateRefreshToken = (payload) =>
  jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn });


/**
 * Logout (no Redis blacklist)
 */
const blacklistToken = async () => {
  return true;
};

module.exports = {
  authenticate,
  requireRole,
  optionalAuth,
  generateAccessToken,
  generateRefreshToken,
  blacklistToken,
};