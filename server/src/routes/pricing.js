const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');

// Initialize Stripe only if API key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

const prisma = new PrismaClient();

// Plans configuration
const PLANS = {
  free: {
    name: 'Ücretsiz',
    price: 0,
    users: 3,
    workspaces: 1,
    storage: 5 // GB
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    price: 29,
    users: Infinity,
    workspaces: Infinity,
    storage: 50
  },
  business: {
    name: 'İşletme',
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID,
    price: 79,
    users: Infinity,
    workspaces: Infinity,
    storage: Infinity
  }
};

// Get plans
router.get('/plans', asyncHandler(async (req, res) => {
  res.json({
    plans: PLANS
  });
}));

// Create checkout session
router.post('/checkout', asyncHandler(async (req, res) => {
  const { planId, userId } = req.body;
  const plan = PLANS[planId];

  if (!plan) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  if (planId === 'free') {
    // For free plan, just update user subscription
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscription: 'free',
        subscriptionStatus: 'active'
      }
    });

    return res.json({ success: true, plan: 'free' });
  }

  // Stripe not configured - return error for paid plans
  if (!stripe) {
    return res.status(503).json({ 
      error: 'Payment processing not configured. Please contact support.' 
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: plan.priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: {
        userId,
        planId
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

// Webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
  // Stripe not configured
  if (!stripe) {
    return res.status(503).json({ error: 'Webhook not configured' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { userId, planId } = session.metadata;

      // Update user subscription
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscription: planId,
          subscriptionStatus: 'active'
        }
      });
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      // Handle subscription cancellation
      // Update user subscription to free
      await prisma.user.updateMany({
        where: { subscription: 'pro' },
        data: { subscription: 'free', subscriptionStatus: 'cancelled' }
      });
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}));

module.exports = router;
