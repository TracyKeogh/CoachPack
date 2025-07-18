import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Target, Sparkles, CreditCard, CheckCircle } from 'lucide-react';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Get product ID from query params
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get('productId') || 'complete-toolkit';

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
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
    
    // Simulate payment processing
    setIsProcessing(true);
    setError(null);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        navigate(`/auth/signup?email=${encodeURIComponent(formData.email)}&name=${encodeURIComponent(formData.name)}&productId=${productId}&payment=completed`);
      }, 2000);
    }, 1500);
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
          <p className="text-sm text-slate-500 mb-6">
            Redirecting to your dashboard...
          </p>
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
        <div className="bg-white rounded-2xl max-w-md w-full shadow-lg border border-slate-200">
          <div className="p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">
              Complete Your Purchase
            </h1>
            
            {/* Product Info */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-purple-900">Complete Toolkit</h3>
                  <p className="text-sm text-purple-600">All tools and assessments</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-900">$49.00</div>
                  <div className="text-sm text-purple-600">one-time</div>
                </div>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}
            
            {/* Checkout Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your name"
                  disabled={isProcessing}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email"
                  disabled={isProcessing}
                />
              </div>
              
              {/* Simulated Card Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Card Details
                </label>
                <div className="border border-slate-300 rounded-lg p-3 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      className="w-full px-2 py-1 border-b border-slate-200 focus:outline-none focus:border-purple-500"
                      placeholder="Card number"
                      disabled={isProcessing}
                    />
                    <CreditCard className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={formData.expiry}
                      onChange={(e) => handleInputChange('expiry', e.target.value)}
                      className="w-1/2 px-2 py-1 border-b border-slate-200 focus:outline-none focus:border-purple-500"
                      placeholder="MM/YY"
                      disabled={isProcessing}
                    />
                    <input
                      type="text"
                      value={formData.cvc}
                      onChange={(e) => handleInputChange('cvc', e.target.value)}
                      className="w-1/2 px-2 py-1 border-b border-slate-200 focus:outline-none focus:border-purple-500"
                      placeholder="CVC"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>Pay $49.00</span>
                )}
              </button>
            </form>
            
            {/* Secure Payment Notice */}
            <div className="mt-6 flex items-center justify-center text-sm text-slate-500">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Your information is secure and encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;