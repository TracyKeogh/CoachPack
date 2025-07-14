import React, { useState } from 'react';
import { X, Mail, ArrowRight, Shield, CheckCircle2, Sparkles } from 'lucide-react';
import { useWheelSignup } from '../hooks/useWheelSignup';
import { saveUser } from '../lib/supabase';

interface WheelSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

const WheelSignupModal: React.FC<WheelSignupModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createSignup } = useWheelSignup();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Save to Supabase
      const { error: saveError } = await saveUser(
        email,
        email.split('@')[0], // Use part of email as name
        'free'
      );
      
      if (saveError) {
        // Ignore duplicate email errors - we'll still create the wheel signup
        if (!saveError.message?.includes('duplicate key') && !saveError.message?.includes('unique constraint')) {
          throw new Error(`Failed to save user: ${saveError.message}`);
        }
      }
      
      // Create wheel signup
      const success = await createSignup(email);
      
      if (success) {
        onSuccess(email);
      } else {
        setError('Failed to create wheel signup. Please try again.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full relative overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Unlock Your Wheel of Life</h3>
              <p className="text-purple-100 text-sm">Free assessment • No credit card required</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-3">
              Get instant access to your personalized life assessment
            </h4>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">Interactive 8-area life wheel</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">Instant results and insights</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">Takes just 5 minutes to complete</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Start My Assessment</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Privacy notice */}
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-slate-600">
                <p className="font-medium mb-1">Your privacy matters</p>
                <p>We'll only use your email to send you your assessment results and occasional tips for intentional living. Unsubscribe anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheelSignupModal;