const Redis = require('ioredis');
const { logger } = require('../utils/logger');
const { performanceLogger } = require('../utils/logger');

// Create Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: times => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Handle Redis connection events
redis.on('connect', () => {
  logger.info('Redis client connected');
});

redis.on('error', err => {
  logger.error('Redis client error:', err);
});

// Cache middleware factory
const cache = duration => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const key = `cache:${req.originalUrl || req.url}`;

    try {
      // Check if data exists in cache
      const cachedData = await redis.get(key);

      if (cachedData) {
        const data = JSON.parse(cachedData);
        return res.json(data);
      }

      // Store original res.json
      const originalJson = res.json;

      // Override res.json method
      res.json = function (data) {
        // Store data in cache
        redis
          .setex(key, duration, JSON.stringify(data))
          .catch(err => logger.error('Cache set error:', err));

        // Call original res.json
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Cache invalidation middleware
const invalidateCache = patterns => {
  return async (req, res, next) => {
    try {
      const keys = await redis.keys(patterns);
      if (keys.length > 0) {
        await redis.del(keys);
        logger.info(`Invalidated ${keys.length} cache keys`);
      }
      next();
    } catch (error) {
      logger.error('Cache invalidation error:', error);
      next();
    }
  };
};

// Performance monitoring middleware
const monitorPerformance = operation => {
  return async (req, res, next) => {
    const start = process.hrtime();

    // Store original res.json
    const originalJson = res.json;

    // Override res.json method
    res.json = function (data) {
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1000000;

      performanceLogger.info({
        operation,
        duration,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
      });

      return originalJson.call(this, data);
    };

    next();
  };
};

// Cache patterns for different resources
const cachePatterns = {
  user: 'cache:*/users/*',
  session: 'cache:*/sessions/*',
  chat: 'cache:*/chats/*',
  location: 'cache:*/locations/*',
  all: 'cache:*',
};

// Cache durations (in seconds)
const cacheDurations = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 3600, // 1 hour
  veryLong: 86400, // 24 hours
};

// Export cache utilities
module.exports = {
  redis,
  cache,
  invalidateCache,
  monitorPerformance,
  cachePatterns,
  cacheDurations,
};
