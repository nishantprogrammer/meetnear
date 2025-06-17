import { logger } from '../utils/logger.js';
import config from '../config.js';
import * as Sentry from '@sentry/node';

// Custom error classes
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

export class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

export class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

export class RateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RateLimitError';
    this.statusCode = 429;
  }
}

export class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = 500;
  }
}

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  // Initialize error object
  const error = {
    status: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
    stack: config.env === 'development' ? err.stack : undefined,
    errors: err.errors || undefined,
  };

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user?.id,
  });

  // Send to Sentry in production
  if (config.env === 'production') {
    Sentry.captureException(err);
  }

  // Handle specific error types
  switch (err.name) {
    case 'ValidationError':
      error.status = 400;
      error.message = 'Validation Error';
      break;

    case 'AuthenticationError':
      error.status = 401;
      error.message = 'Authentication Failed';
      break;

    case 'AuthorizationError':
      error.status = 403;
      error.message = 'Access Denied';
      break;

    case 'NotFoundError':
      error.status = 404;
      error.message = 'Resource Not Found';
      break;

    case 'ConflictError':
      error.status = 409;
      error.message = 'Resource Conflict';
      break;

    case 'RateLimitError':
      error.status = 429;
      error.message = 'Too Many Requests';
      break;

    case 'DatabaseError':
      error.status = 500;
      error.message = 'Database Operation Failed';
      break;

    case 'JsonWebTokenError':
      error.status = 401;
      error.message = 'Invalid Token';
      break;

    case 'TokenExpiredError':
      error.status = 401;
      error.message = 'Token Expired';
      break;

    default:
      // Handle unknown errors
      if (config.env === 'production') {
        error.message = 'Internal Server Error';
        error.stack = undefined;
      }
  }

  // Send error response
  res.status(error.status).json({
    status: 'error',
    message: error.message,
    ...(error.errors && { errors: error.errors }),
    ...(error.stack && { stack: error.stack }),
  });
};

// Async handler wrapper
export const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found handler
export const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
};
