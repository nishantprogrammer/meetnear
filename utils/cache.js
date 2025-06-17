import Redis from 'ioredis';
import { logger } from './logger.js';
import config from '../config.js';

class Cache {
  constructor() {
    this.redis = new Redis(config.database.redis);
    this.defaultTTL = 3600; // 1 hour in seconds

    this.redis.on('error', error => {
      logger.error('Redis cache error:', error);
    });
  }

  // Set cache with optional TTL
  async set(key, value, ttl = this.defaultTTL) {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
      logger.debug('Cache set:', { key, ttl });
    } catch (error) {
      logger.error('Cache set error:', error);
      throw error;
    }
  }

  // Get cache value
  async get(key) {
    try {
      const value = await this.redis.get(key);
      if (!value) return null;

      const parsedValue = JSON.parse(value);
      logger.debug('Cache hit:', { key });
      return parsedValue;
    } catch (error) {
      logger.error('Cache get error:', error);
      throw error;
    }
  }

  // Delete cache
  async del(key) {
    try {
      await this.redis.del(key);
      logger.debug('Cache deleted:', { key });
    } catch (error) {
      logger.error('Cache delete error:', error);
      throw error;
    }
  }

  // Clear all cache
  async clear() {
    try {
      await this.redis.flushall();
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Cache clear error:', error);
      throw error;
    }
  }

  // Get multiple cache values
  async mget(keys) {
    try {
      const values = await this.redis.mget(keys);
      return values.map(value => (value ? JSON.parse(value) : null));
    } catch (error) {
      logger.error('Cache mget error:', error);
      throw error;
    }
  }

  // Set multiple cache values
  async mset(keyValues, ttl = this.defaultTTL) {
    try {
      const pipeline = this.redis.pipeline();

      Object.entries(keyValues).forEach(([key, value]) => {
        const serializedValue = JSON.stringify(value);
        if (ttl) {
          pipeline.setex(key, ttl, serializedValue);
        } else {
          pipeline.set(key, serializedValue);
        }
      });

      await pipeline.exec();
      logger.debug('Cache mset:', { keys: Object.keys(keyValues), ttl });
    } catch (error) {
      logger.error('Cache mset error:', error);
      throw error;
    }
  }

  // Increment counter
  async increment(key, amount = 1) {
    try {
      const value = await this.redis.incrby(key, amount);
      logger.debug('Cache increment:', { key, amount, value });
      return value;
    } catch (error) {
      logger.error('Cache increment error:', error);
      throw error;
    }
  }

  // Decrement counter
  async decrement(key, amount = 1) {
    try {
      const value = await this.redis.decrby(key, amount);
      logger.debug('Cache decrement:', { key, amount, value });
      return value;
    } catch (error) {
      logger.error('Cache decrement error:', error);
      throw error;
    }
  }

  // Set cache if not exists
  async setnx(key, value, ttl = this.defaultTTL) {
    try {
      const serializedValue = JSON.stringify(value);
      const result = await this.redis.setnx(key, serializedValue);

      if (result && ttl) {
        await this.redis.expire(key, ttl);
      }

      logger.debug('Cache setnx:', { key, ttl, result });
      return result;
    } catch (error) {
      logger.error('Cache setnx error:', error);
      throw error;
    }
  }

  // Get cache with TTL
  async getWithTTL(key) {
    try {
      const [value, ttl] = await Promise.all([this.redis.get(key), this.redis.ttl(key)]);

      if (!value) return null;

      return {
        value: JSON.parse(value),
        ttl,
      };
    } catch (error) {
      logger.error('Cache getWithTTL error:', error);
      throw error;
    }
  }

  // Get cache keys by pattern
  async keys(pattern) {
    try {
      const keys = await this.redis.keys(pattern);
      logger.debug('Cache keys:', { pattern, count: keys.length });
      return keys;
    } catch (error) {
      logger.error('Cache keys error:', error);
      throw error;
    }
  }
}

export const cache = new Cache();
