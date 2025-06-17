// ===== MEETNEAR 3.0 - COMPLETE BACKEND SYSTEM =====
// Production-ready backend with Firebase, real-time features, payments, and AI

// ===== 1. CONFIGURATION =====
import config from './config.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { expressjwt } from 'express-jwt';
import { createLogger, format, transports } from 'winston';

// ===== 2. LOGGING SETUP =====
const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.simple(),
    })
  );
}

// ===== 3. FIREBASE CONFIGURATION =====
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  GeoPoint,
  writeBatch,
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = config.firebase;
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// ===== 4. EXPRESS APP SETUP =====
const server = express();
const port = config.server.port || 3000;

// Security middleware
server.use(helmet());
server.use(
  cors({
    origin: config.cors.origins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
server.use(limiter);

// Request parsing
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Logging
server.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// JWT Authentication
server.use(
  expressjwt({
    secret: config.jwt.secret,
    algorithms: ['HS256'],
  }).unless({
    path: ['/api/auth/login', '/api/auth/register', '/api/auth/verify-phone'],
  })
);

// ===== 5. ERROR HANDLING MIDDLEWARE =====
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    logger.error('Error 💥', err);
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production error response
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // Programming or unknown errors
      logger.error('Error 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong',
      });
    }
  }
};

// ===== 6. REQUEST VALIDATION MIDDLEWARE =====
const validateRequest = schema => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }
    next();
  };
};

// ===== 7. CACHE MIDDLEWARE =====
const cache = duration => {
  return (req, res, next) => {
    const key = `__express__${req.originalUrl || req.url}`;
    const cachedBody = cache.get(key);

    if (cachedBody) {
      res.send(cachedBody);
      return;
    }

    res.sendResponse = res.send;
    res.send = body => {
      cache.set(key, body, duration * 1000);
      res.sendResponse(body);
    };
    next();
  };
};

// ===== 8. ROUTES SETUP =====
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import sessionRoutes from './routes/sessions.js';
import paymentRoutes from './routes/payments.js';
import chatRoutes from './routes/chat.js';

server.use('/api/auth', authRoutes);
server.use('/api/users', userRoutes);
server.use('/api/sessions', sessionRoutes);
server.use('/api/payments', paymentRoutes);
server.use('/api/chat', chatRoutes);

// Error handling middleware should be last
server.use(errorHandler);

// ===== 9. SERVER STARTUP =====
server.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

export { server, db, auth, storage, functions, logger, AppError };
