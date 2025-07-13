import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Target, Sparkles, ArrowLeft, CreditCard, Check, Lock, Shield } from 'lucide-react';
import { STRIPE_PRODUCTS } from '../stripe-config';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51OvCVnJDYwbBsAYVXVbMNVfGbkEeGVWRDMJAWXHYELCGJyzPwDztkyuHLWRXQzjBJqSXNwGzpYwGWTcFMXvjzIFw00MpzKLJDm');

interface CheckoutFormProps {
  productId: string;
  email: string;
  onSuccess: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  productId, 
  email, 
  onSuccess 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [billingDetails, setBillingDetails] = useState({
    email: email,
    name: '',
  });

  // Check if Stripe is loaded
  useEffect(() => {
    if (!stripe) {
      setStripeError("Stripe hasn't loaded yet. Please refresh the page.");
    }
  }, [stripe]);

  const product = STRIPE_PRODUCTS.find(p => p.id === productId);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    if (!cardComplete) {
      setError('Please complete your card details');
      return;
    }

    setProcessing(true);

    try {
      // Create a payment method
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: billingDetails,
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message || 'An error occurred with your payment');
        setProcessing(false);
        return;
      }

      // In a real application, you would send the payment method ID to your server
      // and create a payment intent there. For this demo, we'll simulate success.
      console.log('Payment method created:', paymentMethod.id);
      
      // Simulate a successful payment
      setTimeout(() => {
        setProcessing(false);
        onSuccess();
      }, 2000);
      
    } catch (err) {
      setError('An unexpected error occurred');
      setProcessing(false);
    }
  };

  // Display error if Stripe failed to load
  if (stripeError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p className="text-red-600">{stripeError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-red-700 font-medium hover:text-red-800"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
          Name on Card
        </label>
        <input
          id="name"
          type="text"
          placeholder="Jane Smith"
          required
          value={billingDetails.name}
          onChange={(e) => setBillingDetails({ ...billingDetails, name: e.target.value })}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="jane.smith@example.com"
          required
          value={billingDetails.email}
          onChange={(e) => setBillingDetails({ ...billingDetails, email: e.target.value })}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="card" className="block text-sm font-medium text-slate-700 mb-2">
          Card Details
        </label>
          <div className="p-3 border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent bg-white">
            <CardElement
              id="card"
              options={{
                style: {
                  base: {
                    fontSize: '16px', 
                    color: '#424770', 
                    fontFamily: 'Arial, sans-serif',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                    iconColor: '#6772e5',
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
              onChange={(e) => setCardComplete(e.complete)}
            />
          </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-slate-900">{product.name}</span>
          <span className="font-bold text-slate-900">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: product.currency.toUpperCase(),
            }).format(product.price)}
          </span>
        </div>
        <p className="text-sm text-slate-600">{product.description}</p>
      </div>

      <div className="flex items-center space-x-2 text-sm text-slate-600">
        <Lock className="w-4 h-4" />
        <span>Your payment is secure and encrypted</span>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
      >
        {processing ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Pay {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: product.currency.toUpperCase(),
            }).format(product.price)}</span>
          </>
        )}
      </button>
    </form>
  );
};

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [email, setEmail] = useState('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Get productId from URL query params
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get('productId') || 'complete-toolkit';

  useEffect(() => {
    // Get email from localStorage or query params
    const emailFromParams = queryParams.get('email');
    if (emailFromParams) {
      setEmail(emailFromParams);
    }
  }, [queryParams]);

  // Check if Stripe is loaded
  useEffect(() => {
    const checkStripeLoaded = async () => {
      try {
        const stripe = await stripePromise;
        if (stripe) {
          setStripeLoaded(true);
        }
      } catch (error) {
        console.error("Error loading Stripe:", error);
      }
    };
    
    checkStripeLoaded();
  }, []);

  const handlePaymentSuccess = () => {
    setPaymentCompleted(true);
    // Redirect to success page after a delay
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  const product = STRIPE_PRODUCTS.find(p => p.id === productId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative">
              <Target className="w-8 h-8 text-purple-600" />
              <Sparkles className="w-4 h-4 text-orange-400 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Coach Pack</h1>
              <p className="text-sm text-slate-600">Intentional Living Made Actionable</p>
            </div>
          </div>
          
          {paymentCompleted ? (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
              <p className="text-slate-600">Thank you for your purchase. Redirecting you to your dashboard...</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Complete Your Purchase</h2>
              <p className="text-slate-600">Secure checkout for {product?.name || 'Coach Pack'}</p>
            </>
          )}
        </div>

        {/* Back Button */}
        {!paymentCompleted && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}

        {/* Checkout Form */}
        {!paymentCompleted && (
          <>
            {!stripeLoaded ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-700">Loading payment form...</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                <Elements stripe={stripePromise}>
                  <CheckoutForm 
                    productId={productId} 
                    email={email} 
                    onSuccess={handlePaymentSuccess} 
                  />
                </Elements>
              </div>
            )}
          </>
        )}

        {/* Security Notice */}
        {!paymentCompleted && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-600">
                <p className="font-medium mb-1">Secure Payment</p>
                <p>Your payment information is encrypted and secure. We never store your full credit card details.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;