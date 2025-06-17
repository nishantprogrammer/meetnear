import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { format } from 'winston';
import config from '../config.js';
import * as Sentry from '@sentry/node';

// Custom log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Custom log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Create the logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  levels,
  format: logFormat,
  defaultMeta: { service: 'meetnear-api' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    }),

    // Write all logs with level 'info' and below to combined.log
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    }),
  ],
});

// Add console transport in development
if (config.env !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
      ),
    })
  );
}

// Initialize Sentry
Sentry.init({
  dsn: config.logging.sentryDsn,
  environment: config.env,
  tracesSampleRate: 1.0,
});

// Custom logging methods
const customLogger = {
  // Error logging with Sentry integration
  error: (message, meta = {}) => {
    logger.error(message, meta);
    if (config.env === 'production') {
      Sentry.captureException(message, {
        extra: meta,
      });
    }
  },

  // Warning logging
  warn: (message, meta = {}) => {
    logger.warn(message, meta);
  },

  // Info logging
  info: (message, meta = {}) => {
    logger.info(message, meta);
  },

  // HTTP request logging
  http: (message, meta = {}) => {
    logger.http(message, meta);
  },

  // Debug logging (only in development)
  debug: (message, meta = {}) => {
    if (config.env !== 'production') {
      logger.debug(message, meta);
    }
  },

  // Request logging middleware
  requestLogger: (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;

      logger.http('Request completed', {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        userId: req.user?.id,
      });
    });

    next();
  },

  // Error logging middleware
  errorLogger: (err, req, res, next) => {
    logger.error('Unhandled error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userId: req.user?.id,
    });

    next(err);
  },

  // Performance logging
  performance: (operation, duration, meta = {}) => {
    logger.info(`Performance: ${operation}`, {
      duration: `${duration}ms`,
      ...meta,
    });
  },

  // Security logging
  security: (event, meta = {}) => {
    logger.warn(`Security: ${event}`, {
      timestamp: new Date().toISOString(),
      ...meta,
    });
  },

  // Database logging
  database: (operation, meta = {}) => {
    logger.info(`Database: ${operation}`, meta);
  },

  // Cache logging
  cache: (operation, meta = {}) => {
    logger.debug(`Cache: ${operation}`, meta);
  },
};

export { customLogger as logger };
