import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { 
  CreditCard, 
  Lock, 
  ArrowLeft, 
  AlertCircle,
  Target,
  Sparkles,
  RefreshCw
} from 'lucide-react';

// Initialize Stripe - Using separate elements for better control
const stripePromise = loadStripe('pk_live_51ReyfrGR1TepVbUM24taZ0yF9YCkw0ZMnu8alTlMZAGlJMfhnyQ75aZVRJaCmUv4M2ANee5TqIJMchu0y9Jk1B5400bWH0RZUD');

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [stripeReady, setStripeReady] = useState(false);
  const [error, setError] = useState<string>('');
  const [customerInfo, setCustomerInfo] = useState({
    name: searchParams.get('name') || '',
    email: searchParams.get('email') || ''
  });

  // Check when Stripe is ready
  useEffect(() => {
    if (stripe && elements) {
      setStripeReady(true);
    }
  }, [stripe, elements]);

  const productInfo = {
    name: 'Complete Toolkit',
    description: 'Full access to all self-coaching tools',
    price: 4900,
    currency: 'usd'
  };

  const elementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSmoothing: 'antialiased',
        backgroundColor: '#ffffff',
        '::placeholder': {
          color: '#aab7c4',
        },
        ':focus': {
          color: '#424770',
        },
      },
      invalid: {
        color: '#9e2146',
        iconColor: '#9e2146',
      },
      complete: {
        color: '#424770',
        iconColor: '#7c3aed',
      },
    },
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !stripeReady) {
      setError('Payment system is still loading. Please wait a moment and try again.');
      return;
    }

    if (!customerInfo.name.trim() || !customerInfo.email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      setError('Card element not found. Please refresh the page.');
      setIsLoading(false);
      return;
    }

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
        billing_details: {
          name: customerInfo.name,
          email: customerInfo.email,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'An error occurred processing your payment.');
        setIsLoading(false);
        return;
      }

      console.log('Payment method created:', paymentMethod);
      
      // Simulate successful payment and redirect
      setTimeout(() => {
        navigate('/success?payment_intent=pi_simulated_success&amount=4900');
      }, 1000);
      
    } catch (err) {
      console.error('Payment error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const refreshStripe = () => {
    window.location.reload();
  };

  if (!stripeReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-slate-200 text-center max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Payment System</h2>
          <p className="text-slate-600 mb-6">Initializing secure payment processing...</p>
          <button
            onClick={refreshStripe}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Target className="w-8 h-8 text-purple-600" />
                <Sparkles className="w-4 h-4 text-orange-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-900">Coach Pack</span>
                <div className="text-xs text-slate-600">Intentional Living Made Actionable</div>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-6">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200">
          <div className="p-8 pb-0">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Complete Your Purchase
              </h1>
              <p className="text-slate-600">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 pt-0">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name on Card
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Card Number
                </label>
                <div className="border border-slate-300 rounded-lg p-4 bg-white focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
                  <CardNumberElement options={elementOptions} />
                </div>
              </div>

              {/* Card Expiry and CVC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Expiry Date
                  </label>
                  <div className="border border-slate-300 rounded-lg p-4 bg-white focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
                    <CardExpiryElement options={elementOptions} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    CVC
                  </label>
                  <div className="border border-slate-300 rounded-lg p-4 bg-white focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
                    <CardCvcElement options={elementOptions} />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{productInfo.name}</h3>
                  <p className="text-sm text-slate-600">{productInfo.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">
                    ${(productInfo.price / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-slate-500">
              <Lock className="w-4 h-4" />
              <span>Your payment is secure and encrypted</span>
            </div>

            {/* Test Card Info */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700 text-center">
                💳 Test Card: 4242 4242 4242 4242 • Any future date • Any CVC
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!stripeReady || isLoading}
              className="w-full mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Pay ${(productInfo.price / 100).toFixed(2)}</span>
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage: React.FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default CheckoutPage;