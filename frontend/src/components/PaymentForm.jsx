import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import './PaymentForm.css';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here');

const PaymentForm = ({ bookingId, amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          bookingId,
          amount: Math.round(amount * 100) // Convert to cents
        })
      });

      const data = await response.json();
      if (data.success) {
        setClientSecret(data.clientSecret);
      } else {
        setMessage('Failed to initialize payment');
        onError && onError(data.message);
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setMessage('Error initializing payment');
      onError && onError(error.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage('');

    const cardElement = elements.getElement(CardElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        setMessage(error.message);
        onError && onError(error.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage('Payment successful!');
        onSuccess && onSuccess(paymentIntent);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setMessage('Payment failed');
      onError && onError(error.message);
    }

    setIsProcessing(false);
  };

  const cardStyle = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    }
  };

  return (
    <div className="payment-form-container">
      <div className="payment-form">
        <h3>Complete Your Payment</h3>
        <div className="payment-amount">
          <span className="amount-label">Total Amount:</span>
          <span className="amount-value">${amount.toFixed(2)}</span>
        </div>

        <form onSubmit={handleSubmit} className="stripe-form">
          <div className="card-element-container">
            <label htmlFor="card-element">Credit or Debit Card</label>
            <div className="card-element-wrapper">
              <CardElement
                id="card-element"
                options={cardStyle}
                className="card-element"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!stripe || isProcessing || !clientSecret}
            className="payment-submit-btn"
          >
            {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </button>

          {message && (
            <div className={`payment-message ${message.includes('successful') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </form>

        <div className="payment-security">
          <div className="security-icon">🔒</div>
          <p>Your payment information is secure and encrypted</p>
        </div>
      </div>
    </div>
  );
};

const PaymentFormWrapper = (props) => (
  <Elements stripe={stripePromise}>
    <PaymentForm {...props} />
  </Elements>
);

export default PaymentFormWrapper;
