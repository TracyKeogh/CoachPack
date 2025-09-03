import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Target, Sparkles, CreditCard, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    couponCode: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [originalPrice] = useState(49.00);
  const [finalPrice, setFinalPrice] = useState(49.00);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const applyCoupon = async () => {
    if (!formData.couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Validate known codes locally like ALLFREEBUZZY
      const code = formData.couponCode.trim().toUpperCase();
      console.log('Checking coupon code:', code, 'Length:', code.length);
      if (code === 'ALLFREEBUZZY' || 
          code === 'CENTS' ||
          code === '99' ||
          code === 'ONELEFT') {
        setCouponApplied(true);
        setFinalPrice(0); // Set to 0 for now, Stripe will handle actual discount
        setError(null);
      } else {
        // For real Stripe promo codes, validate through backend
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            price_id: import.meta.env.VITE_STRIPE_PRICE_ID || 'price_1OvXXXXXXXXXXXXXXXXXXXX',
            coupon_code: formData.couponCode,
            validate_only: true
          }),
        });

        const data = await response.json();
        
        if (response.ok && data.valid) {
          setCouponApplied(true);
          // Calculate discounted price based on promotion
          const discount = data.promotion?.coupon?.percent_off || data.promotion?.coupon?.amount_off;
          if (data.promotion?.coupon?.percent_off) {
            setFinalPrice(originalPrice * (1 - discount / 100));
          } else if (data.promotion?.coupon?.amount_off) {
            setFinalPrice(Math.max(0, originalPrice - (discount / 100))); // amount_off is in cents
          } else {
            setFinalPrice(0); // 100% discount
          }
          setError(null);
        } else {
          setError(data.error || 'Invalid coupon code');
          setCouponApplied(false);
          setFinalPrice(originalPrice);
        }
      }
    } catch (err) {
      console.error('Error applying coupon:', err);
      setError('Failed to apply coupon. Please try again.');
      setCouponApplied(false);
      setFinalPrice(originalPrice);
    }

    setIsProcessing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Get current user session for the actual checkout (required for payment)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no session but coupon gives free access, redirect to signup
        if (couponApplied && finalPrice === 0) {
          setError('Please create an account to claim your free access');
          // You could redirect to signup page here: navigate('/signup');
          setIsProcessing(false);
          return;
        }
        setError('Please log in to continue');
        setIsProcessing(false);
        return;
      }

      // Call your Stripe checkout function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: import.meta.env.VITE_STRIPE_PRICE_ID || 'price_1OvXXXXXXXXXXXXXXXXXXXX',
          success_url: `${window.location.origin}/checkout-success`,
          cancel_url: `${window.location.origin}/checkout`,
          mode: 'payment',
          ...(formData.couponCode && couponApplied ? { 
            coupon_code: formData.couponCode.toUpperCase() === 'CENTS' ? 'promo_1S3MePGR1TepVbUM276dpJso' :
                        formData.couponCode === '99' ? 'promo_1S3MFDGR1TepVbUMJMSQn5m0' :
                        formData.couponCode.toLowerCase() === 'oneleft' ? 'promo_1S3MVnGR1TepVbUMuztwk0o3' :
                        formData.couponCode 
          } : {})
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError('Failed to process payment. Please try again.');
    }

    setIsProcessing(false);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-lg border border-green-200 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-slate-600 mb-6">
            Thank you for your purchase! You now have access to the Complete Toolkit.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Access Your Toolkit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-lg border border-purple-100">
        {/* Header */}
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/pricing" 
              className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
            <div className="text-sm text-slate-500">Step 2 of 2</div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Complete Your Purchase</h1>
          <p className="text-slate-600 mt-2">Get instant access to your Complete Toolkit</p>
        </div>

        {/* Product Summary */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Complete Toolkit</h3>
                <p className="text-sm text-slate-600">Full access for 30 days</p>
              </div>
            </div>
            <div className="text-right">
              {couponApplied && (
                <div className="text-sm text-slate-500 line-through">${originalPrice.toFixed(2)}</div>
              )}
              <div className="text-lg font-bold text-slate-900">
                ${finalPrice.toFixed(2)}
              </div>
              {couponApplied && (
                <div className="text-sm text-green-600 font-medium">Coupon applied!</div>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                Your Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email"
                  disabled={isProcessing}
                />
              </div>

              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Coupon Code (Optional)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={(e) => handleInputChange('couponCode', e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter coupon code"
                    disabled={isProcessing || couponApplied}
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={isProcessing || couponApplied || !formData.couponCode.trim()}
                    className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {couponApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Continue to Payment - ${finalPrice.toFixed(2)}</span>
                </div>
              )}
            </button>
          </form>
          
          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 flex items-center justify-center">
              <span className="mr-1">🔒</span> Secured by Stripe • SSL Encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;