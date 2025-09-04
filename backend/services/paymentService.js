const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent for booking
const createPaymentIntent = async (booking, car) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        bookingId: booking._id.toString(),
        carId: car._id.toString(),
        userId: booking.user.toString(),
        carName: car.name,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString()
      },
      description: `Car rental: ${car.name} (${booking.totalDays} days)`,
      receipt_email: booking.driverInfo.email,
      shipping: {
        name: booking.driverInfo.name,
        phone: booking.driverInfo.phone,
        address: {
          line1: booking.pickupLocation,
          country: 'US'
        }
      }
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error('Stripe payment intent creation failed:', error);
    throw new Error('Failed to create payment intent');
  }
};

// Confirm payment intent
const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata
    };
  } catch (error) {
    console.error('Payment confirmation failed:', error);
    throw new Error('Failed to confirm payment');
  }
};

// Process refund
const processRefund = async (paymentIntentId, amount, reason) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: Math.round(amount * 100), // Convert to cents
      reason: reason || 'requested_by_customer',
      metadata: {
        originalPaymentIntent: paymentIntentId
      }
    });

    return {
      success: true,
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100
    };
  } catch (error) {
    console.error('Refund processing failed:', error);
    throw new Error('Failed to process refund');
  }
};

// Get payment methods for customer
const getPaymentMethods = async (customerId) => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    });

    return {
      success: true,
      paymentMethods: paymentMethods.data
    };
  } catch (error) {
    console.error('Get payment methods failed:', error);
    throw new Error('Failed to retrieve payment methods');
  }
};

// Create customer
const createCustomer = async (user) => {
  try {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      phone: user.phone,
      metadata: {
        userId: user._id.toString()
      }
    });

    return {
      success: true,
      customerId: customer.id
    };
  } catch (error) {
    console.error('Customer creation failed:', error);
    throw new Error('Failed to create customer');
  }
};

// Webhook signature verification
const verifyWebhookSignature = (payload, signature, secret) => {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    return { success: true, event };
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  createPaymentIntent,
  confirmPaymentIntent,
  processRefund,
  getPaymentMethods,
  createCustomer,
  verifyWebhookSignature
};
