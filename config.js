import dotenv from 'dotenv';
import Joi from 'joi';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define configuration schema
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),
  API_VERSION: Joi.string().default('v1'),

  // Firebase
  FIREBASE_API_KEY: Joi.string().required(),
  FIREBASE_AUTH_DOMAIN: Joi.string().required(),
  FIREBASE_PROJECT_ID: Joi.string().required(),
  FIREBASE_STORAGE_BUCKET: Joi.string().required(),
  FIREBASE_MESSAGING_SENDER_ID: Joi.string().required(),
  FIREBASE_APP_ID: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().required().min(32),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().required().min(32),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  // Database
  MONGODB_URI: Joi.string().required(),
  REDIS_URL: Joi.string().required(),

  // Payment
  RAZORPAY_KEY_ID: Joi.string().required(),
  RAZORPAY_KEY_SECRET: Joi.string().required(),
  STRIPE_PUBLIC_KEY: Joi.string().required(),
  STRIPE_SECRET_KEY: Joi.string().required(),

  // Email
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  EMAIL_FROM: Joi.string().email().required(),

  // SMS
  TWILIO_ACCOUNT_SID: Joi.string().required(),
  TWILIO_AUTH_TOKEN: Joi.string().required(),
  TWILIO_PHONE_NUMBER: Joi.string().required(),

  // Maps
  GOOGLE_MAPS_API_KEY: Joi.string().required(),

  // OpenAI
  OPENAI_API_KEY: Joi.string().required(),

  // Security
  CORS_ORIGINS: Joi.string().required(),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),

  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  SENTRY_DSN: Joi.string().required(),

  // Cache
  CACHE_TTL: Joi.number().default(3600),
  CACHE_MAX_SIZE: Joi.number().default(1000),

  // Feature Flags
  ENABLE_PAYMENTS: Joi.boolean().default(true),
  ENABLE_VIDEO_CALLS: Joi.boolean().default(true),
  ENABLE_PUSH_NOTIFICATIONS: Joi.boolean().default(true),
  ENABLE_CONTENT_MODERATION: Joi.boolean().default(true),
});

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env, { abortEarly: false });

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

// Export configuration
const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  apiVersion: envVars.API_VERSION,

  firebase: {
    apiKey: envVars.FIREBASE_API_KEY,
    authDomain: envVars.FIREBASE_AUTH_DOMAIN,
    projectId: envVars.FIREBASE_PROJECT_ID,
    storageBucket: envVars.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: envVars.FIREBASE_MESSAGING_SENDER_ID,
    appId: envVars.FIREBASE_APP_ID,
  },

  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
  },

  database: {
    mongodb: envVars.MONGODB_URI,
    redis: envVars.REDIS_URL,
  },

  payment: {
    razorpay: {
      keyId: envVars.RAZORPAY_KEY_ID,
      keySecret: envVars.RAZORPAY_KEY_SECRET,
    },
    stripe: {
      publicKey: envVars.STRIPE_PUBLIC_KEY,
      secretKey: envVars.STRIPE_SECRET_KEY,
    },
  },

  email: {
    host: envVars.SMTP_HOST,
    port: envVars.SMTP_PORT,
    user: envVars.SMTP_USER,
    pass: envVars.SMTP_PASS,
    from: envVars.EMAIL_FROM,
  },

  sms: {
    accountSid: envVars.TWILIO_ACCOUNT_SID,
    authToken: envVars.TWILIO_AUTH_TOKEN,
    phoneNumber: envVars.TWILIO_PHONE_NUMBER,
  },

  maps: {
    apiKey: envVars.GOOGLE_MAPS_API_KEY,
  },

  openai: {
    apiKey: envVars.OPENAI_API_KEY,
  },

  security: {
    corsOrigins: envVars.CORS_ORIGINS.split(','),
    rateLimit: {
      windowMs: envVars.RATE_LIMIT_WINDOW_MS,
      max: envVars.RATE_LIMIT_MAX_REQUESTS,
    },
  },

  logging: {
    level: envVars.LOG_LEVEL,
    sentryDsn: envVars.SENTRY_DSN,
  },

  cache: {
    ttl: envVars.CACHE_TTL,
    maxSize: envVars.CACHE_MAX_SIZE,
  },

  features: {
    payments: envVars.ENABLE_PAYMENTS,
    videoCalls: envVars.ENABLE_VIDEO_CALLS,
    pushNotifications: envVars.ENABLE_PUSH_NOTIFICATIONS,
    contentModeration: envVars.ENABLE_CONTENT_MODERATION,
  },

  paths: {
    root: __dirname,
    uploads: path.join(__dirname, 'uploads'),
    logs: path.join(__dirname, 'logs'),
  },
};

export default config;
