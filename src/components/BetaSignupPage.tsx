import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Sparkles, Check, Mail, User, CreditCard } from 'lucide-react';

const BetaSignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    paymentMethod: 'card'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call - replace with actual payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitted(true);
    } catch (error) {
      console.error('Beta signup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Welcome to the Beta!</h1>
          <p className="text-slate-600 mb-6">
            Thank you for joining Coach Pack Beta. You'll receive access instructions via email within 24 hours.
          </p>
          <Link 
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center space-x-2 text-white hover:text-purple-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-purple-400" />
            <Sparkles className="w-6 h-6 text-orange-400" />
          </div>
        </div>

        {/* Beta Signup Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">Join Coach Pack Beta</h1>
              <p className="text-slate-600">
                Get early access to Coach Pack with beta pricing. Includes full platform access and priority support.
              </p>
            </div>

            {/* Beta Benefits */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Beta Program Includes:</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Complete Coach Pack toolkit access</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Priority customer support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Early access to new features</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">Beta pricing - 50% off regular price</span>
                </li>
              </ul>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              {/* Payment Section */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Beta Access Payment
                </h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-700">Coach Pack Beta Access</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-600">$25</span>
                    <span className="text-sm text-slate-500 ml-2 line-through">$50</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  One-time payment for beta access. Includes 3 months of full platform access.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !formData.name || !formData.email}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                  isSubmitting || !formData.name || !formData.email
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg'
                }`}
              >
                {isSubmitting ? 'Processing...' : 'Join Beta Program - $25'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              <p>Secure payment processing. Cancel anytime during beta period.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetaSignupPage;