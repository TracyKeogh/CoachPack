import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Target, Sparkles, ArrowRight, Mail, Key } from 'lucide-react';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isNewUser, setIsNewUser] = useState(true);

  useEffect(() => {
    // You could check if this is a returning customer here
    // For now, assume all successful payments are from new users
    setIsNewUser(true);
  }, [sessionId]);

  const handleContinue = () => {
    navigate('/login');
  };

  if (!sessionId) {
    // Redirect to home if no session ID
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-lg border border-red-200 p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Invalid Access</h1>
          <p className="text-slate-600 mb-6">This page can only be accessed after a successful payment.</p>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
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

      {/* Success Content */}
      <div className="flex items-center justify-center py-12 px-6">
        <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200">
          <div className="p-8">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                Payment Successful!
              </h1>
              <p className="text-slate-600 mb-2">
                Welcome to Coach Pack! Your payment has been processed successfully.
              </p>
              <p className="text-sm text-slate-500">
                Transaction ID: {sessionId}
              </p>
            </div>

            {/* Account Setup Instructions */}
            {isNewUser && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <div className="flex items-start space-x-3">
                  <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Check Your Email</h3>
                    <p className="text-blue-700 mb-4">
                      We've created your Coach Pack account and sent you an email with instructions to set up your password.
                    </p>
                    <div className="space-y-2 text-sm text-blue-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        <span>Check your email inbox (and spam folder)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        <span>Click the "Set Password" link in the email</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        <span>Create your secure password</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        <span>Sign in and start your journey!</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* What's Included */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Your Complete Toolkit Includes:</h3>
              <div className="grid grid-cols-1 gap-2 text-sm text-green-700">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Interactive Wheel of Life Assessment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Values Clarity & Alignment Tools</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Digital Vision Board Builder</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>SMART Goal Setting Framework</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Progress Tracking & Analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Community Templates & Resources</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleContinue}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <Key className="w-5 h-5" />
                <span>Set Up Your Password</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <Link
                to="/"
                className="w-full block text-center px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Return to Home
              </Link>
            </div>

            {/* Support */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500">
                Need help? Contact us at{' '}
                <a href="mailto:hello@spremtlabs.com" className="text-purple-600 hover:text-purple-700">
                  hello@spremtlabs.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;