import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Target, Sparkles, CreditCard, CheckCircle, Shield, Tag, X } from 'lucide-react';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId') || 'complete-toolkit';
  const initialEmail = searchParams.get('email') || '';
  const initialName = searchParams.get('name') || '';
  
  const [formData, setFormData] = useState({
    name: initialName,
    email: initialEmail,
    couponCode: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponApplied, setCouponApplied] = useState<{
    code: string;
    discount: string;
    valid: boolean;
  } | null>(null);
  const [showCouponField, setShowCouponField] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
    
    // Reset coupon when code changes
    if (field === 'couponCode' && couponApplied) {
      setCouponApplied(null);
    }
  };

  const validateCoupon = async () => {
    if (!formData.couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    try {
      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }
      
      // Call validate coupon function
      const response = await fetch(`${supabaseUrl}/functions/v1/validate-coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          coupon_code: formData.couponCode.trim(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.valid) {
          setCouponApplied({
            code: formData.couponCode.trim(),
            discount: result.discount,
            valid: true,
          });
          setError(null);
        } else {
          setError('Invalid or expired coupon code');
        }
      } else {
        setError('Unable to validate coupon code');
      }
    } catch (err) {
      setError('Unable to validate coupon code');
      console.error('Coupon validation error:', err);
    }
  };

  const removeCoupon = () => {
    setCouponApplied(null);
    setFormData(prev => ({ ...prev, couponCode: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
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
      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured. Please set VITE_SUPABASE_URL in your environment variables.');
      }
      
      // Construct the correct Edge Function URL
      const functionUrl = `${supabaseUrl}/functions/v1/stripe-checkout`;
      
      console.log('Calling Edge Function at:', functionUrl);
      
      // Prepare request body
      const requestBody: any = {
        price_id: import.meta.env.VITE_STRIPE_PRICE_ID || 'price_1Rf0j2GR1TepVbUMoQMYDXgT',
        success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/cancel`,
        mode: 'payment',
        email: formData.email,
        name: formData.name,
      };

      // Add coupon if applied
      if (couponApplied && couponApplied.valid) {
        requestBody.coupon_code = couponApplied.code;
      }
      
      // Call Stripe checkout function
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        // Handle error responses
        try {
          const responseText = await response.text();
          console.log('Error response text:', responseText);
          
          if (responseText.trim()) {
            const errorResponse = JSON.parse(responseText);
            throw new Error(errorResponse.error || `Payment service error (${response.status})`);
          } else {
            throw new Error(`Payment service error (${response.status}): Empty response`);
          }
        } catch (parseError) {
          if (response.status === 404) {
            throw new Error('Payment service not found. Please check if the Stripe Edge Function is deployed.');
          }
          throw new Error(`Payment service error (${response.status}): ${response.statusText}`);
        }
      }

      // Handle success responses
      try {
        const responseText = await response.text();
        console.log('Success response text:', responseText);
        
        if (!responseText.trim()) {
          throw new Error('Empty response from payment service');
        }
        
        const responseData = JSON.parse(responseText);
        const { url } = responseData;
        
        // Redirect to Stripe Checkout
        if (url) {
          console.log('Redirecting to Stripe:', url);
          window.location.href = url;
        } else {
          throw new Error('No checkout URL received from payment service');
        }
      } catch (parseError) {
        console.error('Failed to parse success response:', parseError);
        throw new Error('Invalid response from payment service');
      }
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };

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
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Content */}
      <div className="flex items-center justify-center py-12 px-6">
        <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200">
          <div className="p-8">
            {/* Product Summary */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Complete Toolkit</h1>
              <p className="text-slate-600 text-sm mb-4">
                Lifetime access to all Coach Pack tools and features
              </p>
              <div className="text-3xl font-bold text-purple-600">$49.00</div>
              <div className="text-sm text-slate-500">One-time payment • No recurring charges</div>

              {/* Coupon Applied Banner */}
              {couponApplied && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        Coupon "{couponApplied.code}" applied!
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-green-600 hover:text-green-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-green-700 mt-1">{couponApplied.discount}</p>
                </div>
              )}
            </div>

            {/* Account Creation Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">Account Setup</h3>
                  <p className="text-sm text-blue-700">
                    After payment, we'll create your account and send you an email to set your password.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Customer Information Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Enter your full name"
                  required
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
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email address"
                  required
                  disabled={isProcessing}
                />
              </div>

              {/* Coupon Code Section */}
              <div>
                {!showCouponField && !couponApplied && (
                  <button
                    type="button"
                    onClick={() => setShowCouponField(true)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-2"
                  >
                    <Tag className="w-4 h-4" />
                    <span>Have a coupon code?</span>
                  </button>
                )}

                {showCouponField && !couponApplied && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Coupon Code
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.couponCode}
                        onChange={(e) => handleInputChange('couponCode', e.target.value.toUpperCase())}
                        className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                        placeholder="Enter coupon code"
                        disabled={isProcessing}
                      />
                      <button
                        type="button"
                        onClick={validateCoupon}
                        disabled={!formData.couponCode.trim() || isProcessing}
                        className="px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Continue to Payment</span>
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                <Shield className="w-4 h-4" />
                <span>Secured by Stripe • SSL Encrypted</span>
              </div>
            </div>

            {/* Included Features */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">What's included:</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Interactive Wheel of Life Assessment</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Values Clarity & Alignment Tools</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Digital Vision Board Builder</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>SMART Goal Setting Framework</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Progress Tracking & Analytics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Community Templates & Resources</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;