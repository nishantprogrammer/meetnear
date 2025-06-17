import mongoose from 'mongoose';
import Redis from 'ioredis';
import { logger } from './logger.js';
import config from '../config.js';

// MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

// Redis connection options
const redisOptions = {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy: times => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

// MongoDB connection
const connectMongo = async () => {
  try {
    await mongoose.connect(config.database.mongodb, mongoOptions);
    logger.info('MongoDB connected successfully');

    // Handle connection events
    mongoose.connection.on('error', err => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Redis connection
const connectRedis = async () => {
  try {
    const redis = new Redis(config.database.redis, redisOptions);

    redis.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    redis.on('error', err => {
      logger.error('Redis connection error:', err);
    });

    redis.on('close', () => {
      logger.warn('Redis connection closed');
    });

    redis.on('reconnecting', () => {
      logger.info('Redis reconnecting');
    });

    return redis;
  } catch (error) {
    logger.error('Redis connection error:', error);
    process.exit(1);
  }
};

// Database query helpers
const dbHelpers = {
  // MongoDB query helpers
  mongo: {
    // Create document
    create: async (model, data) => {
      try {
        const start = Date.now();
        const result = await model.create(data);
        logger.performance('MongoDB create', Date.now() - start, {
          model: model.modelName,
          dataSize: JSON.stringify(data).length,
        });
        return result;
      } catch (error) {
        logger.error('MongoDB create error:', error);
        throw error;
      }
    },

    // Find document
    find: async (model, query, options = {}) => {
      try {
        const start = Date.now();
        const result = await model.find(query, null, options);
        logger.performance('MongoDB find', Date.now() - start, {
          model: model.modelName,
          querySize: JSON.stringify(query).length,
        });
        return result;
      } catch (error) {
        logger.error('MongoDB find error:', error);
        throw error;
      }
    },

    // Find one document
    findOne: async (model, query, options = {}) => {
      try {
        const start = Date.now();
        const result = await model.findOne(query, null, options);
        logger.performance('MongoDB findOne', Date.now() - start, {
          model: model.modelName,
          querySize: JSON.stringify(query).length,
        });
        return result;
      } catch (error) {
        logger.error('MongoDB findOne error:', error);
        throw error;
      }
    },

    // Update document
    update: async (model, query, data, options = {}) => {
      try {
        const start = Date.now();
        const result = await model.updateOne(query, data, options);
        logger.performance('MongoDB update', Date.now() - start, {
          model: model.modelName,
          querySize: JSON.stringify(query).length,
          dataSize: JSON.stringify(data).length,
        });
        return result;
      } catch (error) {
        logger.error('MongoDB update error:', error);
        throw error;
      }
    },

    // Delete document
    delete: async (model, query) => {
      try {
        const start = Date.now();
        const result = await model.deleteOne(query);
        logger.performance('MongoDB delete', Date.now() - start, {
          model: model.modelName,
          querySize: JSON.stringify(query).length,
        });
        return result;
      } catch (error) {
        logger.error('MongoDB delete error:', error);
        throw error;
      }
    },
  },

  // Redis query helpers
  redis: {
    // Set key-value pair
    set: async (redis, key, value, ttl = null) => {
      try {
        const start = Date.now();
        if (ttl) {
          await redis.set(key, JSON.stringify(value), 'EX', ttl);
        } else {
          await redis.set(key, JSON.stringify(value));
        }
        logger.performance('Redis set', Date.now() - start, {
          key,
          valueSize: JSON.stringify(value).length,
        });
      } catch (error) {
        logger.error('Redis set error:', error);
        throw error;
      }
    },

    // Get value by key
    get: async (redis, key) => {
      try {
        const start = Date.now();
        const value = await redis.get(key);
        logger.performance('Redis get', Date.now() - start, { key });
        return value ? JSON.parse(value) : null;
      } catch (error) {
        logger.error('Redis get error:', error);
        throw error;
      }
    },

    // Delete key
    del: async (redis, key) => {
      try {
        const start = Date.now();
        await redis.del(key);
        logger.performance('Redis del', Date.now() - start, { key });
      } catch (error) {
        logger.error('Redis del error:', error);
        throw error;
      }
    },

    // Set hash field
    hset: async (redis, key, field, value) => {
      try {
        const start = Date.now();
        await redis.hset(key, field, JSON.stringify(value));
        logger.performance('Redis hset', Date.now() - start, {
          key,
          field,
          valueSize: JSON.stringify(value).length,
        });
      } catch (error) {
        logger.error('Redis hset error:', error);
        throw error;
      }
    },

    // Get hash field
    hget: async (redis, key, field) => {
      try {
        const start = Date.now();
        const value = await redis.hget(key, field);
        logger.performance('Redis hget', Date.now() - start, { key, field });
        return value ? JSON.parse(value) : null;
      } catch (error) {
        logger.error('Redis hget error:', error);
        throw error;
      }
    },
  },
};

// Export database utilities
export const database = {
  connectMongo,
  connectRedis,
  dbHelpers,
};
