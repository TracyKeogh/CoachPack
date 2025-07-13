import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Target, Sparkles, CreditCard, AlertCircle } from 'lucide-react';
import { useStripe } from '../hooks/useStripe';
import { STRIPE_PRODUCTS } from '../stripe-config';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { redirectToCheckout, loading, error } = useStripe();
  
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Get product ID from query params
  const productId = searchParams.get('productId') || 'complete-toolkit';
  const email = searchParams.get('email') || '';
  const name = searchParams.get('name') || '';
  
  // Find the product
  const product = STRIPE_PRODUCTS.find(p => p.id === productId);

  // Redirect to checkout on mount
  useEffect(() => {
    const initiateCheckout = async () => {
      if (!product) {
        setLocalError('Invalid product selected');
        return;
      }
      
      if (!email) {
        setLocalError('Email is required');
        return;
      }
      
      setIsRedirecting(true);
      
      try {
        await redirectToCheckout(productId);
      } catch (err) {
        setLocalError('Failed to redirect to checkout');
        setIsRedirecting(false);
      }
    };
    
    initiateCheckout();
  }, [productId, email, redirectToCheckout, product]);

  const goBack = () => {
    navigate(-1);
  };

  if (localError || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-3">
                <div className="relative">
                  <Target className="w-8 h-8 text-purple-600" />
                  <Sparkles className="w-4 h-4 text-orange-400 absolute -top-1 -right-1" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-slate-900">Coach Pack</span>
                  <div className="text-xs text-slate-600">Intentional Living Made Actionable</div>
                </div>
              </Link>
              
              <button
                onClick={goBack}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="flex items-center justify-center py-12 px-6">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Checkout Error
              </h1>
              <p className="text-slate-600">
                {localError || error || 'An error occurred during checkout'}
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Try Again
              </button>
              
              <button
                onClick={goBack}
                className="w-full px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
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
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative">
                <Target className="w-8 h-8 text-purple-600" />
                <Sparkles className="w-4 h-4 text-orange-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-900">Coach Pack</span>
                <div className="text-xs text-slate-600">Intentional Living Made Actionable</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Loading Content */}
      <div className="flex items-center justify-center py-12 px-6">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Redirecting to Checkout
          </h1>
          <p className="text-slate-600 mb-6">
            Please wait while we prepare your secure checkout...
          </p>
          
          {product && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-purple-900">{product.name}</h3>
                  <p className="text-sm text-purple-600">{product.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-900">${product.price.toFixed(2)}</div>
                  <div className="text-sm text-purple-600">one-time</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
            <CreditCard className="w-4 h-4" />
            <span>Secure payment processing by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;