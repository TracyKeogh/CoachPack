import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, Target, Sparkles } from 'lucide-react';

const CancelPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Cancel Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Cancelled</h1>
          <p className="text-slate-600">No worries! Your payment was cancelled and no charges were made.</p>
        </div>

        {/* Information */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">What Happened?</h2>
          <div className="space-y-3 text-slate-600">
            <p>• Your payment was cancelled before completion</p>
            <p>• No charges were made to your payment method</p>
            <p>• You can try again anytime</p>
          </div>
        </div>

        {/* Still Interested */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
          <h3 className="text-lg font-semibold mb-3">Still Interested?</h3>
          <p className="text-purple-100 mb-4">
            Coach Pack helps thousands transform their lives through structured self-coaching tools. 
            Join them in creating lasting change.
          </p>
          <div className="space-y-2 text-purple-100 text-sm">
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Complete life assessment tools</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Values clarification process</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Visual goal setting</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>12-week action planning</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/pricing')}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            <span>Try Again</span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Coach Pack Branding */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center space-x-2 text-slate-500">
            <div className="relative">
              <Target className="w-5 h-5 text-purple-600" />
              <Sparkles className="w-3 h-3 text-orange-400 absolute -top-1 -right-1" />
            </div>
            <span className="text-sm">Coach Pack - Intentional Living Made Actionable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelPage;