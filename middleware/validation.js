import Joi from 'joi';
import { ValidationError } from './errorHandler.js';
import { logger } from '../utils/logger.js';

// Common validation schemas
const commonSchemas = {
  id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Invalid ID format',
    }),

  email: Joi.string().email().lowercase().trim().messages({
    'string.email': 'Invalid email format',
  }),

  password: Joi.string()
    .min(8)
    .max(100)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .messages({
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    }),

  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .messages({
      'string.pattern.base': 'Invalid phone number format',
    }),

  coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

// Validation schemas for different routes
const schemas = {
  // Auth routes
  auth: {
    register: Joi.object({
      email: commonSchemas.email.required(),
      password: commonSchemas.password.required(),
      name: Joi.string().min(2).max(50).required(),
      phone: commonSchemas.phone.required(),
    }),

    login: Joi.object({
      email: commonSchemas.email.required(),
      password: Joi.string().required(),
    }),

    verifyPhone: Joi.object({
      phone: commonSchemas.phone.required(),
      code: Joi.string().length(6).required(),
    }),

    resetPassword: Joi.object({
      email: commonSchemas.email.required(),
    }),

    updatePassword: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: commonSchemas.password.required(),
    }),
  },

  // User routes
  user: {
    updateProfile: Joi.object({
      name: Joi.string().min(2).max(50),
      bio: Joi.string().max(500),
      interests: Joi.array().items(Joi.string()).max(10),
      location: commonSchemas.coordinates,
      avatar: Joi.string().uri(),
      settings: Joi.object({
        notifications: Joi.boolean(),
        privacy: Joi.object({
          showLocation: Joi.boolean(),
          showOnline: Joi.boolean(),
          showLastSeen: Joi.boolean(),
        }),
      }),
    }),

    search: Joi.object({
      query: Joi.string().min(2).max(50),
      ...commonSchemas.pagination,
    }),
  },

  // Session routes
  session: {
    create: Joi.object({
      type: Joi.string().valid('coffee', 'lunch', 'dinner', 'activity').required(),
      location: commonSchemas.coordinates.required(),
      date: Joi.date().min('now').required(),
      duration: Joi.number().integer().min(30).max(240).required(),
      maxParticipants: Joi.number().integer().min(2).max(10).required(),
      description: Joi.string().max(500),
    }),

    update: Joi.object({
      status: Joi.string().valid('active', 'cancelled', 'completed'),
      location: commonSchemas.coordinates,
      date: Joi.date().min('now'),
      duration: Joi.number().integer().min(30).max(240),
      maxParticipants: Joi.number().integer().min(2).max(10),
      description: Joi.string().max(500),
    }),

    join: Joi.object({
      message: Joi.string().max(200),
    }),
  },

  // Chat routes
  chat: {
    sendMessage: Joi.object({
      content: Joi.string().max(1000).required(),
      type: Joi.string().valid('text', 'image', 'location').required(),
      metadata: Joi.object({
        imageUrl: Joi.string().uri(),
        location: commonSchemas.coordinates,
      }).when('type', {
        is: 'image',
        then: Joi.object({ imageUrl: Joi.required() }),
        otherwise: Joi.object({ location: Joi.required() }),
      }),
    }),

    createGroup: Joi.object({
      name: Joi.string().min(2).max(50).required(),
      description: Joi.string().max(200),
      participants: Joi.array().items(commonSchemas.id).min(2).max(50).required(),
    }),
  },

  // Payment routes
  payment: {
    createPayment: Joi.object({
      amount: Joi.number().positive().required(),
      currency: Joi.string().valid('INR', 'USD').required(),
      description: Joi.string().max(200).required(),
      sessionId: commonSchemas.id.required(),
    }),

    verifyPayment: Joi.object({
      paymentId: Joi.string().required(),
      orderId: Joi.string().required(),
      signature: Joi.string().required(),
    }),
  },
};

// Validation middleware factory
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationError = new ValidationError('Validation Error');
      validationError.errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      logger.warn('Validation error', {
        path: req.path,
        method: req.method,
        errors: validationError.errors,
      });

      return next(validationError);
    }

    next();
  };
};

// Export validation schemas and middleware
export const validation = {
  schemas,
  validate,
  commonSchemas,
};
