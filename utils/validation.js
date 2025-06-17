import Joi from 'joi';
import { logger } from './logger.js';

// Common validation schemas
export const schemas = {
  // User validation schemas
  user: {
    create: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      name: Joi.string().min(2).max(50).required(),
      phone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/),
      location: Joi.object({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2).required(),
      }),
      interests: Joi.array().items(Joi.string()),
      preferences: Joi.object({
        radius: Joi.number().min(1).max(100).default(10),
        notifications: Joi.object({
          email: Joi.boolean().default(true),
          push: Joi.boolean().default(true),
        }),
        privacy: Joi.object({
          showLocation: Joi.boolean().default(true),
          showInterests: Joi.boolean().default(true),
        }),
      }),
    }),

    update: Joi.object({
      name: Joi.string().min(2).max(50),
      phone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/),
      location: Joi.object({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2).required(),
      }),
      interests: Joi.array().items(Joi.string()),
      preferences: Joi.object({
        radius: Joi.number().min(1).max(100),
        notifications: Joi.object({
          email: Joi.boolean(),
          push: Joi.boolean(),
        }),
        privacy: Joi.object({
          showLocation: Joi.boolean(),
          showInterests: Joi.boolean(),
        }),
      }),
    }),
  },

  // Session validation schemas
  session: {
    create: Joi.object({
      title: Joi.string().min(3).max(100).required(),
      description: Joi.string().min(10).max(1000).required(),
      type: Joi.string().valid('coffee', 'lunch', 'dinner', 'activity', 'other').required(),
      location: Joi.object({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2).required(),
        address: Joi.object({
          street: Joi.string(),
          city: Joi.string(),
          state: Joi.string(),
          country: Joi.string(),
          postalCode: Joi.string(),
        }),
        venue: Joi.object({
          name: Joi.string(),
          type: Joi.string(),
        }),
      }).required(),
      startTime: Joi.date().min('now').required(),
      endTime: Joi.date().min(Joi.ref('startTime')).required(),
      maxParticipants: Joi.number().min(2).max(50).default(10),
      tags: Joi.array().items(Joi.string()),
      visibility: Joi.string().valid('public', 'private', 'invite-only').default('public'),
    }),

    update: Joi.object({
      title: Joi.string().min(3).max(100),
      description: Joi.string().min(10).max(1000),
      type: Joi.string().valid('coffee', 'lunch', 'dinner', 'activity', 'other'),
      location: Joi.object({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2).required(),
        address: Joi.object({
          street: Joi.string(),
          city: Joi.string(),
          state: Joi.string(),
          country: Joi.string(),
          postalCode: Joi.string(),
        }),
        venue: Joi.object({
          name: Joi.string(),
          type: Joi.string(),
        }),
      }),
      startTime: Joi.date().min('now'),
      endTime: Joi.date().min(Joi.ref('startTime')),
      maxParticipants: Joi.number().min(2).max(50),
      tags: Joi.array().items(Joi.string()),
      visibility: Joi.string().valid('public', 'private', 'invite-only'),
    }),
  },

  // Chat validation schemas
  chat: {
    message: Joi.object({
      content: Joi.string().max(1000).required(),
      type: Joi.string().valid('text', 'image', 'location', 'system').default('text'),
      metadata: Joi.object({
        imageUrl: Joi.string().uri(),
        location: Joi.object({
          type: Joi.string().valid('Point').default('Point'),
          coordinates: Joi.array().items(Joi.number()).length(2),
        }),
      }),
    }),
  },
};

// Validation helper functions
export const validate = {
  // Validate data against schema
  async validate(schema, data) {
    try {
      const result = await schema.validateAsync(data, {
        abortEarly: false,
        stripUnknown: true,
      });
      return { value: result, error: null };
    } catch (error) {
      logger.warn('Validation error:', error);
      return {
        value: null,
        error: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      };
    }
  },

  // Validate coordinates
  validateCoordinates(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return false;
    }

    const [longitude, latitude] = coordinates;
    return (
      typeof longitude === 'number' &&
      typeof latitude === 'number' &&
      longitude >= -180 &&
      longitude <= 180 &&
      latitude >= -90 &&
      latitude <= 90
    );
  },

  // Validate phone number
  validatePhone(phone) {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
  },

  // Validate email
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength
  validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    );
  },

  // Validate date range
  validateDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    return start > now && end > start;
  },

  // Validate file type
  validateFileType(file, allowedTypes) {
    return allowedTypes.includes(file.mimetype);
  },

  // Validate file size
  validateFileSize(file, maxSize) {
    return file.size <= maxSize;
  },
};

// Export validation utilities
export default {
  schemas,
  validate,
};
