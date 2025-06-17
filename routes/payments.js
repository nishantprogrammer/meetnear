const express = require('express');
const router = express.Router();
const { validate } = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');
const { Payment } = require('../models/payment');
const { User } = require('../models/user');
const { sendNotification } = require('../utils/notifications');
const { logger } = require('../utils/logger');
const Razorpay = require('razorpay');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create payment intent
router.post('/create-intent', auth, rateLimiter, validate('createPayment'), async (req, res) => {
  try {
    const { amount, currency = 'INR', paymentMethod = 'razorpay' } = req.body;

    if (paymentMethod === 'razorpay') {
      const order = await razorpay.orders.create({
        amount: amount * 100, // Convert to paise
        currency,
        receipt: `receipt_${Date.now()}`,
      });

      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      });
    } else if (paymentMethod === 'stripe') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          userId: req.user.id,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      });
    } else {
      res.status(400).json({ error: 'Invalid payment method' });
    }
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify payment
router.post('/verify', auth, rateLimiter, validate('verifyPayment'), async (req, res) => {
  try {
    const { paymentId, orderId, signature, paymentMethod } = req.body;

    if (paymentMethod === 'razorpay') {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (generatedSignature !== signature) {
        return res.status(400).json({ error: 'Invalid signature' });
      }

      const payment = new Payment({
        user: req.user.id,
        amount: req.body.amount,
        currency: req.body.currency,
        paymentId,
        orderId,
        status: 'completed',
        paymentMethod,
      });

      await payment.save();

      // Update user's premium status
      const user = await User.findById(req.user.id);
      user.isPremium = true;
      user.premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await user.save();

      // Send notification
      await sendNotification({
        userId: req.user.id,
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Successful',
        body: 'Your premium subscription has been activated',
      });

      res.json({ message: 'Payment verified successfully' });
    } else if (paymentMethod === 'stripe') {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: 'Payment not successful' });
      }

      const payment = new Payment({
        user: req.user.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        paymentId,
        status: 'completed',
        paymentMethod,
      });

      await payment.save();

      // Update user's premium status
      const user = await User.findById(req.user.id);
      user.isPremium = true;
      user.premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await user.save();

      // Send notification
      await sendNotification({
        userId: req.user.id,
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Successful',
        body: 'Your premium subscription has been activated',
      });

      res.json({ message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ error: 'Invalid payment method' });
    }
  } catch (error) {
    logger.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payment history
router.get('/history', auth, rateLimiter, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    logger.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel subscription
router.post('/cancel-subscription', auth, rateLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.isPremium) {
      return res.status(400).json({ error: 'No active subscription' });
    }

    user.isPremium = false;
    user.premiumExpiresAt = undefined;
    await user.save();

    // Send notification
    await sendNotification({
      userId: req.user.id,
      type: 'SUBSCRIPTION_CANCELLED',
      title: 'Subscription Cancelled',
      body: 'Your premium subscription has been cancelled',
    });

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    logger.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get subscription status
router.get('/subscription', auth, rateLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('isPremium premiumExpiresAt');

    res.json({
      isPremium: user.isPremium,
      expiresAt: user.premiumExpiresAt,
    });
  } catch (error) {
    logger.error('Error fetching subscription status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create refund
router.post('/refund', auth, rateLimiter, validate('createRefund'), async (req, res) => {
  try {
    const { paymentId, reason } = req.body;
    const payment = await Payment.findOne({
      _id: paymentId,
      user: req.user.id,
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    if (payment.paymentMethod === 'razorpay') {
      const refund = await razorpay.payments.refund(payment.paymentId, {
        amount: payment.amount * 100,
      });

      payment.status = 'refunded';
      payment.refundId = refund.id;
      payment.refundReason = reason;
      await payment.save();

      // Update user's premium status
      const user = await User.findById(req.user.id);
      user.isPremium = false;
      user.premiumExpiresAt = undefined;
      await user.save();

      // Send notification
      await sendNotification({
        userId: req.user.id,
        type: 'REFUND_PROCESSED',
        title: 'Refund Processed',
        body: 'Your payment has been refunded',
      });

      res.json({ message: 'Refund processed successfully' });
    } else if (payment.paymentMethod === 'stripe') {
      const refund = await stripe.refunds.create({
        payment_intent: payment.paymentId,
        reason: 'requested_by_customer',
      });

      payment.status = 'refunded';
      payment.refundId = refund.id;
      payment.refundReason = reason;
      await payment.save();

      // Update user's premium status
      const user = await User.findById(req.user.id);
      user.isPremium = false;
      user.premiumExpiresAt = undefined;
      await user.save();

      // Send notification
      await sendNotification({
        userId: req.user.id,
        type: 'REFUND_PROCESSED',
        title: 'Refund Processed',
        body: 'Your payment has been refunded',
      });

      res.json({ message: 'Refund processed successfully' });
    } else {
      res.status(400).json({ error: 'Invalid payment method' });
    }
  } catch (error) {
    logger.error('Error processing refund:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payment methods
router.get('/methods', auth, rateLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('paymentMethods');

    res.json(user.paymentMethods || []);
  } catch (error) {
    logger.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add payment method
router.post('/methods', auth, rateLimiter, validate('addPaymentMethod'), async (req, res) => {
  try {
    const { type, details } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.paymentMethods) {
      user.paymentMethods = [];
    }

    user.paymentMethods.push({
      type,
      details,
      isDefault: user.paymentMethods.length === 0,
    });

    await user.save();

    res.json(user.paymentMethods);
  } catch (error) {
    logger.error('Error adding payment method:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove payment method
router.delete('/methods/:id', auth, rateLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.paymentMethods) {
      return res.status(404).json({ error: 'No payment methods found' });
    }

    user.paymentMethods = user.paymentMethods.filter(
      method => method._id.toString() !== req.params.id
    );

    await user.save();

    res.json(user.paymentMethods);
  } catch (error) {
    logger.error('Error removing payment method:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set default payment method
router.put('/methods/:id/default', auth, rateLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.paymentMethods) {
      return res.status(404).json({ error: 'No payment methods found' });
    }

    user.paymentMethods = user.paymentMethods.map(method => ({
      ...method,
      isDefault: method._id.toString() === req.params.id,
    }));

    await user.save();

    res.json(user.paymentMethods);
  } catch (error) {
    logger.error('Error setting default payment method:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
