import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Target, Sparkles, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type SignupFormValues = z.infer<typeof signupSchema>;

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, error: authError, loading: authLoading, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Get product ID from query params if available
  const queryParams = new URLSearchParams(location.search);
  const productId = queryParams.get('productId') || 'complete';
  const prefilledEmail = queryParams.get('email') || '';
  const prefilledName = queryParams.get('name') || '';
  const paymentCompleted = queryParams.get('payment') === 'completed';

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: prefilledName,
      email: prefilledEmail,
      password: '',
      confirmPassword: '',
      acceptTerms: false
    }
  });

  const onSubmit = async (data: SignupFormValues) => {
    clearError();
    setSaveError(null);
    
    try {
      console.log('SignupPage: Starting signup process');
      
      // Create the auth user with custom redirect URL
      await signUp(
        data.email, 
        data.password, 
        data.name,
        `${window.location.origin}/auth/login`
      );
      
      console.log('SignupPage: User signup completed successfully');
      
      // Set success state
      setSignupSuccess(true);
      
    } catch (error) {
      console.error('SignupPage: Unexpected error during signup:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setSaveError(errorMessage);
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

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-6">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200">
          <div className="p-8">
            {signupSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Check Your Email</h2>
                <p className="text-slate-600 mb-6">
                  We've sent a confirmation email to your inbox. Please click the link in the email to verify your account and complete the signup process.
                </p>
                
                {paymentCompleted && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-sm text-green-800">
                    <p className="font-medium mb-1">✅ Payment Confirmed</p>
                    <p>Your $50 payment has been processed successfully. Once you confirm your email, you'll have full access to Coach Pack.</p>
                  </div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 mb-6">
                  <p className="font-medium mb-1">What's next?</p>
                  <div className="text-left space-y-1">
                    <p>1. Check your email inbox (and spam folder)</p>
                    <p>2. Click the confirmation link in the email</p>
                    <p>3. You'll be redirected to the login page</p>
                    <p>4. Sign in with your credentials to access Coach Pack</p>
                  </div>
                </div>
                
                <div className="text-sm text-slate-500">
                  <p>Didn't receive the email? Check your spam folder or contact support.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    {paymentCompleted ? 'Complete Your Account Setup' : 'Create Your Account'}
                  </h1>
                  <p className="text-slate-600">
                    {paymentCompleted 
                      ? 'Your payment was successful! Now create your account to access Coach Pack.'
                      : 'Join Coach Pack and start your journey to intentional living'
                    }
                  </p>
                </div>

                {paymentCompleted && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-green-800">Payment Confirmed</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Your payment has been processed successfully. Complete your account setup to access all Coach Pack features.
                      </p>
                    </div>
                  </div>
                )}

                {/* Plan Info */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-purple-900">Complete Toolkit</h3>
                      <p className="text-sm text-purple-600">
                        {paymentCompleted ? 'Payment completed - All tools and assessments' : 'All tools and assessments'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-900">$50</div>
                      <div className="text-sm text-purple-600">
                        {paymentCompleted ? 'paid' : 'one-time'}
                      </div>
                    </div>
                  </div>
                </div>

                {(authError || saveError) && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">
                        {(authError || saveError)?.includes('email rate limit') ? 'Rate limit reached' : 'Registration failed'}
                      </h3>
                      <p className="text-sm text-red-700 mt-1">{authError || saveError}</p>
                      {(authError || saveError)?.includes('email rate limit') && (
                        <p className="text-sm text-red-600 mt-2 font-medium">
                          This is a temporary restriction. You can try again in 10-15 minutes.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="name"
                        type="text"
                        className={`w-full pl-10 pr-4 py-3 border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent`}
                        placeholder="Enter your full name"
                        {...register('name')}
                        disabled={isSubmitting || authLoading}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="email"
                        type="email"
                        className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent`}
                        placeholder="Enter your email"
                        {...register('email')}
                        disabled={isSubmitting || authLoading}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        className={`w-full pl-10 pr-12 py-3 border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent`}
                        placeholder="Create a password (min 8 characters)"
                        {...register('password')}
                        disabled={isSubmitting || authLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`w-full pl-10 pr-12 py-3 border ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent`}
                        placeholder="Confirm your password"
                        {...register('confirmPassword')}
                        disabled={isSubmitting || authLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="acceptTerms"
                        type="checkbox"
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-300 rounded"
                        {...register('acceptTerms')}
                        disabled={isSubmitting || authLoading}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="acceptTerms" className="text-slate-700">
                        I agree to the{' '}
                        <Link to="/terms" className="text-purple-600 hover:text-purple-700 font-medium">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-purple-600 hover:text-purple-700 font-medium">
                          Privacy Policy
                        </Link>
                      </label>
                      {errors.acceptTerms && (
                        <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || authLoading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {(isSubmitting || authLoading) ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>

                  {/* Sign In Link */}
                  <div className="text-center">
                    <p className="text-sm text-slate-600">
                      Already have an account?{' '}
                      <Link 
                        to="/login"
                        className="font-medium text-purple-600 hover:text-purple-700"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;