const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const { logger } = require('../utils/logger');

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

redis.on('error', error => {
  logger.error('Redis error:', error);
});

// General API rate limiter
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:api:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints rate limiter
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Payment endpoints rate limiter
const paymentLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:payment:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many payment attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Chat endpoints rate limiter
const chatLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:chat:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per windowMs
  message: 'Too many chat messages, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload rate limiter
const uploadLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:upload:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 uploads per windowMs
  message: 'Too many file uploads, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Session creation rate limiter
const sessionLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:session:',
  }),
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // Limit each IP to 10 session creations per windowMs
  message: 'Too many session creations, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Dynamic rate limiter based on user tier
const dynamicLimiter = (req, res, next) => {
  const { user } = req;
  let maxRequests;

  if (user.isPremium) {
    maxRequests = 1000; // Premium users get 1000 requests per window
  } else {
    maxRequests = 100; // Free users get 100 requests per window
  }

  const limiter = rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: `rl:dynamic:${user.id}:`,
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: maxRequests,
    message: 'Rate limit exceeded, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });

  limiter(req, res, next);
};

// IP-based rate limiter
const ipLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:ip:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// User-based rate limiter
const userLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:user:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each user to 100 requests per minute
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req => req.user.id, // Use user ID as key
});

// Combined rate limiter
const combinedLimiter = (req, res, next) => {
  Promise.all([
    new Promise(resolve => ipLimiter(req, res, resolve)),
    new Promise(resolve => {
      if (req.user) {
        userLimiter(req, res, resolve);
      } else {
        resolve();
      }
    }),
  ]).then(() => next());
};

module.exports = {
  apiLimiter,
  authLimiter,
  paymentLimiter,
  chatLimiter,
  uploadLimiter,
  sessionLimiter,
  dynamicLimiter,
  ipLimiter,
  userLimiter,
  combinedLimiter,
  rateLimiter: combinedLimiter, // Default export
};
