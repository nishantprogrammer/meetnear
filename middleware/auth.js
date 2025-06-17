const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const { logger } = require('../utils/logger');
const { AppError } = require('../utils/errors');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findOne({
      _id: decoded.id,
      'tokens.token': token,
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403);
    }

    // Check if token is expired
    if (user.tokens.find(t => t.token === token).expiresAt < new Date()) {
      throw new AppError('Token expired', 401);
    }

    // Add user and token to request
    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }

    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};

// Premium user check
const requirePremium = async (req, res, next) => {
  try {
    if (!req.user.isPremium) {
      return res.status(403).json({
        error: 'Premium subscription required for this feature',
      });
    }

    // Check if premium subscription is expired
    if (req.user.premiumExpiresAt < new Date()) {
      req.user.isPremium = false;
      await req.user.save();

      return res.status(403).json({
        error: 'Your premium subscription has expired',
      });
    }

    next();
  } catch (error) {
    logger.error('Premium check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Phone verification check
const requirePhoneVerification = async (req, res, next) => {
  try {
    if (!req.user.isPhoneVerified) {
      return res.status(403).json({
        error: 'Phone verification required',
      });
    }
    next();
  } catch (error) {
    logger.error('Phone verification check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Location sharing check
const requireLocationSharing = async (req, res, next) => {
  try {
    if (!req.user.preferences?.locationSharing) {
      return res.status(403).json({
        error: 'Location sharing must be enabled for this feature',
      });
    }
    next();
  } catch (error) {
    logger.error('Location sharing check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Session participant check
const requireSessionParticipant = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!session.participants.includes(req.user.id)) {
      return res.status(403).json({
        error: 'You must be a participant to perform this action',
      });
    }

    req.session = session;
    next();
  } catch (error) {
    logger.error('Session participant check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Session creator check
const requireSessionCreator = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.creator.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Only the session creator can perform this action',
      });
    }

    req.session = session;
    next();
  } catch (error) {
    logger.error('Session creator check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Conversation participant check
const requireConversationParticipant = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({
        error: 'You must be a participant to perform this action',
      });
    }

    req.conversation = conversation;
    next();
  } catch (error) {
    logger.error('Conversation participant check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Message sender check
const requireMessageSender = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Only the message sender can perform this action',
      });
    }

    req.message = message;
    next();
  } catch (error) {
    logger.error('Message sender check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  auth,
  authorize,
  requirePremium,
  requirePhoneVerification,
  requireLocationSharing,
  requireSessionParticipant,
  requireSessionCreator,
  requireConversationParticipant,
  requireMessageSender,
};
