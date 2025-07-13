import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Target, Sparkles, ArrowRight } from 'lucide-react';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentIntent = searchParams.get('payment_intent');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
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
              Welcome to Coach Pack! Your purchase of the Complete Toolkit has been confirmed.
            </p>

            {/* Payment Details */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-green-900 mb-2">What's Next?</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>✓ Check your email for access instructions</p>
                <p>✓ Your account has been activated</p>
                <p>✓ Start with the Wheel of Life assessment</p>
              </div>
            </div>

            {/* Transaction ID */}
            {paymentIntent && (
              <div className="text-xs text-slate-500 mb-6">
                Transaction ID: {paymentIntent}
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors font-semibold flex items-center justify-center space-x-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Support */}
            <p className="mt-4 text-xs text-slate-500">
              Need help? Contact us at support@coachpack.org
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;