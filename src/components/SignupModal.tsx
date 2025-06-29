import React, { useState, useEffect } from 'react';
import { X, Mail, ArrowRight, Shield, CheckCircle2, Sparkles, User, Lock, Eye, EyeOff, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useRevenueCat } from '../RevenueCatProvider';
import { PurchasesPackage } from '@revenuecat/purchases-js';
import { useStripe } from '../hooks/useStripe';
import { STRIPE_PRODUCTS } from '../stripe-config';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  selectedPlan: 'complete' | 'monthly' | null;
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSuccess, selectedPlan }) => {
  const { signUp, signIn, loading: authLoading, error: authError, clearError, hasActiveSubscription } = useAuth();
  const { offerings, purchasePackage, isLoading: rcLoading, error: rcError } = useRevenueCat();
  const { redirectToCheckout, loading: stripeLoading } = useStripe();
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const planDetails = {
    complete: {
      name: 'Complete Toolkit',
      price: '$49',
      period: 'one-time',
      description: 'Full access to all self-coaching tools for 30 days',
      packageId: 'complete_toolkit' // This should match your Stripe product ID
    },
    monthly: {
      name: 'Ongoing Tracking',
      price: '$19',
      period: 'month',
      description: 'Continuous access with ongoing tracking',
      packageId: 'monthly_pro' // This should match your RevenueCat package identifier
    }
  };

  const currentPlan = selectedPlan ? planDetails[selectedPlan] : planDetails.complete;

  // Combine errors from auth, RevenueCat, and Stripe
  useEffect(() => {
    setError(authError || rcError || null);
  }, [authError, rcError]);

  // Find the package from offerings for RevenueCat
  const getPackageForPlan = (): PurchasesPackage | null => {
    if (!offerings || !selectedPlan || selectedPlan !== 'monthly') return null;
    
    for (const offering of offerings) {
      const packages = offering.availablePackages;
      const targetPackage = packages.find(pkg => pkg.identifier === currentPlan.packageId);
      if (targetPackage) return targetPackage;
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setError(null);
    setIsProcessing(true);

    try {
      if (mode === 'signup') {
        // Validation for signup
        if (!formData.name.trim()) {
          setError('Name is required');
          setIsProcessing(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsProcessing(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsProcessing(false);
          return;
        }

        // Sign up the user
        await signUp(formData.email, formData.password, formData.name);
        
        // Handle payment based on selected plan
        if (selectedPlan) {
          await handlePayment();
        } else {
          onSuccess({ email: formData.email, name: formData.name });
        }
      } else {
        // Sign in
        await signIn(formData.email, formData.password);
        
        // Check if user already has subscription
        if (hasActiveSubscription()) {
          onSuccess({ email: formData.email });
        } else if (selectedPlan) {
          // User signed in but needs to purchase
          await handlePayment();
        } else {
          onSuccess({ email: formData.email });
        }
      }
    } catch (err) {
      // Error is handled by the auth hook
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    try {
      if (selectedPlan === 'monthly') {
        // RevenueCat subscription
        const packageToPurchase = getPackageForPlan();
        
        if (!packageToPurchase) {
          setError('Selected plan is not available. Please try again.');
          return;
        }

        const { userCancelled } = await purchasePackage(packageToPurchase);
        
        if (!userCancelled) {
          // Purchase successful
          onSuccess({ 
            email: formData.email, 
            name: formData.name,
            subscriptionType: 'monthly'
          });
        }
      } else {
        // Stripe one-time payment
        const stripeProduct = STRIPE_PRODUCTS.find(p => p.id === currentPlan.packageId) || STRIPE_PRODUCTS[0];
        
        await redirectToCheckout({
          priceId: stripeProduct.priceId,
          mode: 'payment',
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/cancel`,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
    if (authError) clearError();
  };

  const switchMode = () => {
    setMode(mode === 'signup' ? 'signin' : 'signup');
    clearError();
    setError(null);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  if (!isOpen) return null;

  const loading = authLoading || rcLoading || stripeLoading || isProcessing;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full relative overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/20 rounded-full transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {mode === 'signup' ? 'Get Complete Access' : 'Welcome Back'}
              </h3>
              <p className="text-purple-100 text-sm">
                {mode === 'signup' ? currentPlan.description : 'Sign in to continue your journey'}
              </p>
            </div>
          </div>

          {/* Plan details for signup */}
          {mode === 'signup' && selectedPlan && (
            <div className="bg-white/10 rounded-lg p-3 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{currentPlan.name}</div>
                  <div className="text-purple-100 text-sm">{currentPlan.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{currentPlan.price}</div>
                  <div className="text-purple-200 text-sm">/{currentPlan.period}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-3">
              {mode === 'signup' ? 'Create your account' : 'Sign in to your account'}
            </h4>
            
            {mode === 'signup' && selectedPlan && (
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700">Complete self-coaching toolkit</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700">Progress tracking & analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700">Data sync across devices</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={mode === 'signup' ? 'Create a password (min 6 characters)' : 'Enter your password'}
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Confirm your password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">Passwords do not match</p>
                )}
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (mode === 'signup' && formData.password !== formData.confirmPassword)}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {selectedPlan && mode === 'signup' ? (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Create Account & Purchase</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Switch between signup and signin */}
          <div className="mt-6 text-center">
            <button
              onClick={switchMode}
              className="text-purple-600 hover:text-purple-700 font-medium"
              disabled={loading}
            >
              {mode === 'signup' 
                ? 'Already have an account? Sign in' 
                : 'Need an account? Sign up'
              }
            </button>
          </div>

          {/* Privacy notice */}
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-slate-600">
                <p className="font-medium mb-1">Secure & Private</p>
                <p>Your data is encrypted and secure. We never share your personal information. Cancel anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;