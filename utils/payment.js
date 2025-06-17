const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Razorpay = require('razorpay');
const { logger } = require('./logger');
const { PaymentError } = require('./errors');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Stripe payment intent
const createStripePaymentIntent = async (amount, currency, metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logger.info('Stripe payment intent created:', paymentIntent.id);
    return paymentIntent;
  } catch (error) {
    logger.error('Error creating Stripe payment intent:', error);
    throw new PaymentError(error.message);
  }
};

// Create Razorpay order
const createRazorpayOrder = async (amount, currency, receipt, notes = {}) => {
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency.toUpperCase(),
      receipt,
      notes,
    });

    logger.info('Razorpay order created:', order.id);
    return order;
  } catch (error) {
    logger.error('Error creating Razorpay order:', error);
    throw new PaymentError(error.message);
  }
};

// Verify Stripe payment
const verifyStripePayment = async paymentIntentId => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new PaymentError('Payment not successful');
    }

    logger.info('Stripe payment verified:', paymentIntentId);
    return paymentIntent;
  } catch (error) {
    logger.error('Error verifying Stripe payment:', error);
    throw new PaymentError(error.message);
  }
};

// Verify Razorpay payment
const verifyRazorpayPayment = async (orderId, paymentId, signature) => {
  try {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      throw new PaymentError('Invalid signature');
    }

    const order = await razorpay.orders.fetch(orderId);

    if (order.status !== 'paid') {
      throw new PaymentError('Payment not successful');
    }

    logger.info('Razorpay payment verified:', orderId);
    return order;
  } catch (error) {
    logger.error('Error verifying Razorpay payment:', error);
    throw new PaymentError(error.message);
  }
};

// Create Stripe subscription
const createStripeSubscription = async (customerId, priceId, metadata = {}) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    logger.info('Stripe subscription created:', subscription.id);
    return subscription;
  } catch (error) {
    logger.error('Error creating Stripe subscription:', error);
    throw new PaymentError(error.message);
  }
};

// Create Razorpay subscription
const createRazorpaySubscription = async (planId, customerId, notes = {}) => {
  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // 12 months
      notes,
    });

    logger.info('Razorpay subscription created:', subscription.id);
    return subscription;
  } catch (error) {
    logger.error('Error creating Razorpay subscription:', error);
    throw new PaymentError(error.message);
  }
};

// Cancel Stripe subscription
const cancelStripeSubscription = async subscriptionId => {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    logger.info('Stripe subscription cancelled:', subscriptionId);
    return subscription;
  } catch (error) {
    logger.error('Error cancelling Stripe subscription:', error);
    throw new PaymentError(error.message);
  }
};

// Cancel Razorpay subscription
const cancelRazorpaySubscription = async subscriptionId => {
  try {
    const subscription = await razorpay.subscriptions.cancel(subscriptionId);
    logger.info('Razorpay subscription cancelled:', subscriptionId);
    return subscription;
  } catch (error) {
    logger.error('Error cancelling Razorpay subscription:', error);
    throw new PaymentError(error.message);
  }
};

// Create Stripe refund
const createStripeRefund = async (paymentIntentId, amount) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: Math.round(amount * 100), // Convert to cents
    });

    logger.info('Stripe refund created:', refund.id);
    return refund;
  } catch (error) {
    logger.error('Error creating Stripe refund:', error);
    throw new PaymentError(error.message);
  }
};

// Create Razorpay refund
const createRazorpayRefund = async (paymentId, amount, notes = {}) => {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: Math.round(amount * 100), // Convert to paise
      notes,
    });

    logger.info('Razorpay refund created:', refund.id);
    return refund;
  } catch (error) {
    logger.error('Error creating Razorpay refund:', error);
    throw new PaymentError(error.message);
  }
};

// Get payment provider based on currency
const getPaymentProvider = currency => {
  const stripeCurrencies = ['usd', 'eur', 'gbp'];
  const razorpayCurrencies = ['inr'];

  if (stripeCurrencies.includes(currency.toLowerCase())) {
    return 'stripe';
  } else if (razorpayCurrencies.includes(currency.toLowerCase())) {
    return 'razorpay';
  } else {
    throw new PaymentError('Unsupported currency');
  }
};

module.exports = {
  createStripePaymentIntent,
  createRazorpayOrder,
  verifyStripePayment,
  verifyRazorpayPayment,
  createStripeSubscription,
  createRazorpaySubscription,
  cancelStripeSubscription,
  cancelRazorpaySubscription,
  createStripeRefund,
  createRazorpayRefund,
  getPaymentProvider,
};
