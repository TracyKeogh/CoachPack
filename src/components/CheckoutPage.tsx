import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
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

// Force a fresh Stripe instance
let stripeInstance: any = null;

const getStripeInstance = async () => {
  if (!stripeInstance) {
    stripeInstance = await loadStripe('pk_live_51ReyfrGR1TepVbUM24taZ0yF9YCkw0ZMnu8alTlMZAGlJMfhnyQ75aZVRJaCmUv4M2ANee5TqIJMchu0y9Jk1B5400bWH0RZUD');
  }
  return stripeInstance;
};

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [stripeReady, setStripeReady] = useState(false);
  const [error, setError] = useState<string>('');
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string>('');
  
  const [customerInfo, setCustomerInfo] = useState({
    name: searchParams.get('name') || '',
    email: searchParams.get('email') || ''
  });

  // Check when Stripe is ready
  useEffect(() => {
    const checkStripe = async () => {
      if (stripe && elements) {
        console.log('Stripe is ready!');
        setStripeReady(true);
      }
    };
    
    checkStripe();
  }, [stripe, elements]);

  const productInfo = {
    name: 'Complete Toolkit',
    description: 'Full access to all self-coaching tools',
    price: 4900,
    currency: 'usd'
  };

  // Card element options with forced styling
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '18px',
        color: '#1f2937',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSmoothing: 'antialiased',
        backgroundColor: '#ffffff',
        padding: '12px',
        '::placeholder': {
          color: '#9ca3af',
        },
        ':focus': {
          color: '#1f2937',
        },
        ':hover': {
          color: '#1f2937',
        },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
      complete: {
        color: '#059669',
        iconColor: '#059669',
      },
    },
    hidePostalCode: false,
    iconStyle: 'solid' as const,
    disabled: false,
  };

  const handleCardChange = (event: any) => {
    setCardComplete(event.complete);
    setCardError(event.error ? event.error.message : '');
    
    if (event.error) {
      console.log('Card error:', event.error);
    } else {
      console.log('Card event:', event);
    }
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

    if (!cardComplete) {
      setError('Please enter complete card information.');
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
      console.log('Creating payment method...');
      
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: customerInfo.name,
          email: customerInfo.email,
        },
      });

      if (stripeError) {
        console.error('Stripe error:', stripeError);
        setError(stripeError.message || 'An error occurred processing your payment.');
        setIsLoading(false);
        return;
      }

      console.log('Payment method created successfully:', paymentMethod);
      
      // Simulate successful payment
      setTimeout(() => {
        navigate('/success?payment_intent=pi_simulated_success&amount=4900');
      }, 1500);
      
    } catch (err) {
      console.error('Payment error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  // Show loading state
  if (!stripeReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-slate-200 text-center max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Initializing Payment System</h2>
          <p className="text-slate-600 mb-6">Setting up secure payment processing...</p>
          <button
            onClick={refreshPage}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Page</span>
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

            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name on Card
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-slate-900"
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
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-slate-900"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Card Element - Single unified input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Card Information
                </label>
                <div className="border border-slate-300 rounded-lg p-4 bg-white focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent min-h-[60px] flex items-center">
                  <div className="w-full">
                    <CardElement 
                      options={cardElementOptions}
                      onChange={handleCardChange}
                    />
                  </div>
                </div>
                {cardError && (
                  <p className="mt-1 text-sm text-red-600">{cardError}</p>
                )}
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
              <p className="text-xs text-blue-700 text-center font-medium">
                💳 Test Card: 4242 4242 4242 4242 • 12/34 • 123
              </p>
            </div>

            {/* Debug Info */}
            <div className="mt-2 text-xs text-slate-400 text-center">
              Stripe Ready: {stripeReady ? '✅' : '❌'} | Card Complete: {cardComplete ? '✅' : '❌'}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!stripeReady || isLoading || !cardComplete}
              className="w-full mt-6 px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Payment...</span>
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
  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    const initStripe = async () => {
      const stripe = await getStripeInstance();
      setStripePromise(stripe);
    };
    
    initStripe();
  }, []);

  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Stripe...</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ appearance: { theme: 'stripe' } }}>
      <CheckoutForm />
    </Elements>
  );
};

export default CheckoutPage;