import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import config from '../config.js';
import { logger } from '../utils/logger.js';

// CORS configuration
export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = config.security.corsOrigins;
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Rate limiting configuration
export const rateLimiter = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.max,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: 'Too many requests, please try again later',
    });
  },
});

// Helmet configuration
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.meetnear.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
};

// Security middleware
export const securityMiddleware = [
  // Basic security headers
  helmet(helmetConfig),

  // CORS
  cors(corsOptions),

  // Rate limiting
  rateLimiter,

  // Request body size limit
  (req, res, next) => {
    if (req.headers['content-length'] > 1024 * 1024) {
      // 1MB
      return res.status(413).json({
        status: 'error',
        message: 'Request entity too large',
      });
    }
    next();
  },

  // XSS protection
  (req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  },

  // Prevent clickjacking
  (req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  },

  // Prevent MIME type sniffing
  (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  },

  // Prevent caching of sensitive data
  (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    next();
  },

  // Request validation
  (req, res, next) => {
    // Validate content type for POST/PUT requests
    if ((req.method === 'POST' || req.method === 'PUT') && !req.is('application/json')) {
      return res.status(415).json({
        status: 'error',
        message: 'Unsupported Media Type',
      });
    }
    next();
  },

  // Log security events
  (req, res, next) => {
    const securityEvent = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      method: req.method,
      path: req.path,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id,
    };

    // Log suspicious activities
    if (
      req.headers['user-agent']?.includes('curl') ||
      req.headers['user-agent']?.includes('wget')
    ) {
      logger.warn('Suspicious user agent detected', securityEvent);
    }

    next();
  },
];

// Export security utilities
export const securityUtils = {
  // Sanitize user input
  sanitizeInput: input => {
    if (typeof input !== 'string') return input;
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  // Validate file type
  validateFileType: (file, allowedTypes) => {
    return allowedTypes.includes(file.mimetype);
  },

  // Generate secure random string
  generateSecureString: (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    array.forEach(value => {
      result += chars[value % chars.length];
    });
    return result;
  },
};
