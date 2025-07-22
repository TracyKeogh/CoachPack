import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Target, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const CheckoutSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false);

  // Get session details from URL params
  const sessionId = searchParams.get('session_id');
  const paymentIntent = searchParams.get('payment_intent');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setVerificationError('No session ID found. Please contact support if you were charged.');
        setIsVerifying(false);
        return;
      }

      try {
        // For now, we'll assume the payment was successful if we have a session ID
        // The webhook will handle user creation and access provisioning
        setPaymentDetails({ sessionId });
        
        // Check if user needs to set up their password
        if (!user) {
          setNeedsPasswordReset(true);
        }
        
      } catch (error) {
        console.error('Payment verification error:', error);
        setVerificationError('Unable to verify payment. Please contact support.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, user]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Verifying Payment</h2>
          <p className="text-slate-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  if (verificationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-lg border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Payment Verification Issue</h2>
          <p className="text-slate-600 mb-6">{verificationError}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go to Dashboard
            </button>
            <p className="text-sm text-slate-500">
              Contact: hello@spremtlabs.com with session ID: {sessionId}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
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
        </div>
      </div>

      {/* Success Content */}
      <div className="flex items-center justify-center py-12 px-6">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 text-center">
          <div className="p-8">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Payment Successful!
            </h1>
            <p className="text-slate-600 mb-6">
              Welcome to Coach Pack! Your purchase has been confirmed and your account is now active.
            </p>

            {/* Payment Details */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-green-900 mb-2">What's Included</h3>
              <div className="text-sm text-green-700 space-y-1 text-left">
                <p>✓ Complete Toolkit Access ($50)</p>
                <p>✓ 30 days of full platform access</p>
                <p>✓ All coaching tools and assessments</p>
                <p>✓ Progress tracking and analytics</p>
              </div>
            </div>

            {/* Next Steps */}
            {needsPasswordReset ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Account Setup</h3>
                <div className="text-sm text-blue-700 space-y-1 text-left">
                  <p>1. Check your email for account setup instructions</p>
                  <p>2. Click the link to set your password</p>
                  <p>3. Sign in to access your dashboard</p>
                  <p>4. Start with the Wheel of Life assessment</p>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
                <div className="text-sm text-blue-700 space-y-1 text-left">
                  <p>1. Access your dashboard immediately</p>
                  <p>2. Start with the Wheel of Life assessment</p>
                  <p>3. Complete your values clarification</p>
                  <p>4. Create your vision board and goals</p>
                </div>
              </div>
            )}

            {/* Transaction ID */}
            {sessionId && (
              <div className="text-xs text-slate-500 mb-6">
                Transaction ID: {sessionId}
              </div>
            )}

            {/* Continue Button */}
            {needsPasswordReset ? (
              <div className="space-y-3">
                <Link
                  to="/auth/login"
                  className="w-full block text-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Go to Sign In
                </Link>
                <p className="text-sm text-slate-500 text-center">
                  Check your email for password setup instructions
                </p>
              </div>
            ) : (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <span>Access Your Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}

            {/* Support */}
            <p className="mt-4 text-xs text-slate-500">
              Need help? Contact us at hello@spremtlabs.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;