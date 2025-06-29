import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Target, Sparkles } from 'lucide-react';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
          <p className="text-slate-600">Thank you for your purchase. Your access has been activated.</p>
        </div>

        {/* Purchase Details */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Purchase Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Product:</span>
              <span className="font-medium text-slate-900">Complete Toolkit</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Amount:</span>
              <span className="font-medium text-slate-900">$49.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Date:</span>
              <span className="font-medium text-slate-900">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Access Period:</span>
              <span className="font-medium text-slate-900">14 weeks</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Status:</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
          <h3 className="text-lg font-semibold mb-3">What's Next?</h3>
          <div className="space-y-2 text-purple-100">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete your Wheel of Life assessment</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Clarify your core values</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Create your vision board</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Set your 12-week goals</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            <span>Start Your Journey</span>
            <ArrowRight className="w-5 h-5" />
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

export default SuccessPage;