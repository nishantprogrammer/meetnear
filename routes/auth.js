import express from 'express';
import Joi from 'joi';
import { auth } from '../meetnear-backend.js';
import { AppError } from '../meetnear-backend.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().required(),
  phone: Joi.string().required(),
  bio: Joi.string(),
  photo: Joi.string(),
  interests: Joi.array().items(Joi.string()),
  isCreator: Joi.boolean(),
  creatorRate: Joi.number().min(0),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const phoneVerificationSchema = Joi.object({
  phoneNumber: Joi.string().required(),
  verificationCode: Joi.string().required(),
});

// Routes
router.post('/register', validateRequest(registerSchema), async (req, res, next) => {
  try {
    const { email, password, ...userData } = req.body;

    // Create user in Firebase Auth
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const { user } = userCredential;

    // Create user profile in Firestore
    await db
      .collection('users')
      .doc(user.uid)
      .set({
        uid: user.uid,
        email,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    // Generate JWT token
    const token = await auth.createCustomToken(user.uid);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          uid: user.uid,
          email,
          ...userData,
        },
        token,
      },
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
});

router.post('/login', validateRequest(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Sign in user
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const { user } = userCredential;

    // Get user profile
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    // Generate JWT token
    const token = await auth.createCustomToken(user.uid);

    res.status(200).json({
      status: 'success',
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    next(new AppError('Invalid email or password', 401));
  }
});

router.post('/verify-phone', validateRequest(phoneVerificationSchema), async (req, res, next) => {
  try {
    const { phoneNumber, verificationCode } = req.body;

    // Verify phone number
    const confirmationResult = await auth.confirmPhoneNumber(phoneNumber, verificationCode);

    res.status(200).json({
      status: 'success',
      message: 'Phone number verified successfully',
    });
  } catch (error) {
    next(new AppError('Invalid verification code', 400));
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    await auth.signOut();

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(new AppError(error.message, 400));
  }
});

export default router;
