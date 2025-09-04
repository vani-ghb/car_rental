const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const {
  createPaymentIntent,
  confirmPaymentIntent,
  processRefund,
  getPaymentMethods,
  createCustomer,
  verifyWebhookSignature
} = require('../services/paymentService');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/payments/create-session
// @desc    Create payment session (Stripe integration)
// @access  Private (requires auth middleware)

router.post('/create-session', authenticate, [
  body('bookingId').isMongoId().withMessage('Invalid booking ID'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('currency').optional().isIn(['usd', 'eur', 'gbp']).withMessage('Invalid currency')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId, amount, currency = 'usd' } = req.body;

    // Verify booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to pay for this booking' });
    }

    // Get car details
    const car = await Car.findById(booking.car);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Create payment intent
    const paymentResult = await createPaymentIntent(booking, car);

    // Save payment record
    const payment = new Payment({
      booking: booking._id,
      user: req.user._id,
      amount: amount,
      currency: currency,
      status: 'pending',
      paymentMethod: 'card',
      stripePaymentIntentId: paymentResult.paymentIntentId,
      description: `Car rental payment for booking ${booking._id}`,
      metadata: {
        carId: car._id,
        carName: car.name,
        startDate: booking.startDate,
        endDate: booking.endDate
      }
    });
    await payment.save();

    res.json({
      success: true,
      clientSecret: paymentResult.clientSecret,
      paymentId: payment._id
    });
  } catch (error) {
    console.error('Create payment session error:', error);
    res.status(500).json({ message: 'Server error while creating payment session' });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle payment webhook from Stripe
// @access  Public (secured with webhook signature verification)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const payload = req.body;
    const verification = verifyWebhookSignature(payload, sig, webhookSecret);
    if (!verification.success) {
      console.error('Webhook signature verification failed:', verification.error);
      return res.status(400).send(`Webhook Error: ${verification.error}`);
    }
    event = verification.event;

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent was successful:', paymentIntent.id);

        // Update payment and booking status
        const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });
        if (payment) {
          payment.status = 'succeeded';
          payment.completedAt = new Date();
          await payment.save();

          const booking = await Booking.findById(payment.booking);
          if (booking) {
            booking.status = 'confirmed';
            await booking.save();
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        console.log('PaymentIntent failed:', failedIntent.id);

        const failedPayment = await Payment.findOne({ stripePaymentIntentId: failedIntent.id });
        if (failedPayment) {
          failedPayment.status = 'failed';
          failedPayment.failedAt = new Date();
          failedPayment.failureReason = failedIntent.last_payment_error && failedIntent.last_payment_error.message;
          await failedPayment.save();

          const failedBooking = await Booking.findById(failedPayment.booking);
          if (failedBooking) {
            failedBooking.status = 'payment_failed';
            await failedBooking.save();
          }
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

// @route   GET /api/payments/history
// @desc    Get user's payment history
// @access  Private (requires auth middleware)
router.get('/history', authenticate, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('booking', 'car startDate endDate')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Server error while fetching payment history' });
  }
});

// @route   POST /api/payments/refund
// @desc    Process refund for a booking
// @access  Private (requires auth middleware and admin check)
router.post('/refund', authenticate, [
  body('bookingId').isMongoId().withMessage('Invalid booking ID'),
  body('amount').isFloat({ min: 0 }).withMessage('Refund amount must be positive'),
  body('reason').optional().trim().isLength({ min: 1 }).withMessage('Refund reason is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId, amount, reason } = req.body;

    // Verify admin permission (assuming req.user.isAdmin)
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin privileges required for refund' });
    }

    // Find payment for booking
    const payment = await Payment.findOne({ booking: bookingId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Process refund through payment service
    const refundResult = await processRefund(payment.stripePaymentIntentId, amount, reason);

    // Update payment record
    payment.refundedAmount += amount;
    payment.refundReason = reason;
    if (payment.refundedAmount >= payment.amount) {
      payment.status = 'refunded';
    }
    await payment.save();

    // Update booking status if fully refunded
    if (payment.status === 'refunded') {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.status = 'cancelled';
        await booking.save();
      }
    }

    res.json({
      success: true,
      refund: refundResult
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ message: 'Server error while processing refund' });
  }
});

// @route   GET /api/payments/methods
// @desc    Get available payment methods
// @access  Public
router.get('/methods', async (req, res) => {
  try {
    // In a real app, you might fetch this from a configuration or database
    const paymentMethods = [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Pay securely with your card',
        icon: 'credit-card',
        enabled: true
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Pay with your PayPal account',
        icon: 'paypal',
        enabled: true
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Direct bank transfer',
        icon: 'bank',
        enabled: false
      }
    ];

    res.json({ paymentMethods });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Server error while fetching payment methods' });
  }
});

module.exports = router;
