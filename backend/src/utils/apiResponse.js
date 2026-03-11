// src/utils/apiResponse.js
// Standardized API response envelope

/**
 * Send a successful response
 */
const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send a created response
 */
const created = (res, data = null, message = 'Created successfully') => {
  return success(res, data, message, 201);
};

/**
 * Send a paginated response
 */
const paginated = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page * pagination.limit < pagination.total,
      hasPrev: pagination.page > 1,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send an error response
 */
const error = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const body = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

/**
 * Common error shortcuts
 */
const notFound = (res, message = 'Resource not found') => error(res, message, 404);
const badRequest = (res, message = 'Bad request', errors = null) => error(res, message, 400, errors);
const unauthorized = (res, message = 'Unauthorized') => error(res, message, 401);
const forbidden = (res, message = 'Forbidden') => error(res, message, 403);
const conflict = (res, message = 'Conflict') => error(res, message, 409);
const tooManyRequests = (res, message = 'Too many requests') => error(res, message, 429);
const serviceUnavailable = (res, message = 'Service unavailable') => error(res, message, 503);

module.exports = {
  success,
  created,
  paginated,
  error,
  notFound,
  badRequest,
  unauthorized,
  forbidden,
  conflict,
  tooManyRequests,
  serviceUnavailable,
};