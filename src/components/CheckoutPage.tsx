import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements, 
  CardElement, 
  useStripe, 
  useElements,
  CardElementProps
} from '@stripe/react-stripe-js';
import { 
  CreditCard, 
  Lock, 
  ArrowLeft, 
  Check,
  AlertCircle,
  Target,
  Sparkles 
} from 'lucide-react';

// Initialize Stripe
// Use a test publishable key if environment variable is not set
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx';
const stripePromise = loadStripe(stripeKey);

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

  // Check if Stripe is loaded
  useEffect(() => {
    if (stripe) {
      setStripeReady(true);
    }
  }, [stripe]);

  const productInfo = {
    name: 'Complete Toolkit',
    description: 'Full access to all self-coaching tools',
    price: 4900, // $49.00 in cents
    currency: 'usd'
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found. Please refresh the page.');
      setIsLoading(false);
      return;
    }

    try {
      // In a real app, you would create a payment intent on your backend
      // For now, we'll simulate a successful payment
      
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
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

      // Simulate successful payment
      console.log('Payment method created:', paymentMethod);
      
      // Redirect to success page
      navigate('/success?payment_intent=pi_simulated_success');
      
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const cardElementOptions: CardElementProps['options'] = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: '#aab7c4',
        },
        iconColor: '#666EE8'
      },
      invalid: {
        color: '#9e2146',
        iconColor: '#fa755a'
      }
    },
    hidePostalCode: true
  };

  // Handle card element change
  const handleCardChange = (event: any) => {
    if (event.error) {
      setError(event.error.message);
    } else {
      setError('');
    }
  };

  if (!stripeReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading payment system...</h2>
          <p className="text-slate-600">Please wait while we initialize Stripe.</p>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                Refresh page
              </button>
            </div>
          )}
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
          {/* Header */}
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

          {/* Form */}
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Card Element */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Card Details
                </label>
                <div className="border border-slate-300 rounded-lg p-4 bg-white focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
                  <CardElement 
                    options={cardElementOptions} 
                    onChange={handleCardChange}
                    className="py-2"
                  />
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!stripe || isLoading}
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

            {/* Test Card Notice */}
            <p className="mt-4 text-xs text-slate-500 text-center">
              Test with card number: 4242 4242 4242 4242
            </p>
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