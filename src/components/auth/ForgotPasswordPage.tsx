import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, Target, Sparkles, AlertCircle, CheckCircle, RefreshCw, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword, clearError, testEmailService } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailSentTime, setEmailSentTime] = useState<Date | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [emailServiceStatus, setEmailServiceStatus] = useState<'unknown' | 'working' | 'not-working'>('unknown');

  const { 
    register, 
    handleSubmit, 
    getValues,
    formState: { errors } 
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  // Enable resend button after 60 seconds
  useEffect(() => {
    if (emailSentTime) {
      const timer = setTimeout(() => {
        setCanResend(true);
      }, 60000);
      
      return () => clearTimeout(timer);
    }
  }, [emailSentTime]);

  // Test email service when component mounts
      const options = {
        redirectTo: redirectTo || (import.meta.env.PROD 
          ? 'https://coachpack.org/auth/reset-password'
          : `${window.location.origin}/auth/reset-password`)
      };
      
      console.log('AuthProvider: Using redirect URL:', options.redirectTo);
    };
    
    checkEmailService();
  }, [testEmailService]);

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    clearError();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await resetPassword(data.email, `${window.location.origin}/reset-password`);
      setEmailSentTime(new Date());
      setCanResend(false);
      setSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    if (!canResend) return;
    
    setIsResending(true);
    setError(null);
    
    try {
      const email = getValues('email');
      await resetPassword(email, `${window.location.origin}/reset-password`);
      setEmailSentTime(new Date());
      setCanResend(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend reset email';
      setError(errorMessage);
    } finally {
      setIsResending(false);
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
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Reset Email Sent</h2>
                <p className="text-slate-600 mb-6">
                  We've sent a password reset link to your email address at {emailSentTime?.toLocaleTimeString()}.
                  Please check your inbox and follow the instructions.
                </p>
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-left">
                    <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Important Information
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-2">
                      <li>• The email may take 2-5 minutes to arrive</li>
                      <li>• Please check your spam/junk folder</li>
                      <li>• The link in the email will expire after 24 hours</li>
                    </ul>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-3">Didn't receive the email?</p>
                    <div className="space-y-3">
                      <button
                        onClick={handleResendEmail}
                        disabled={!canResend || isResending}
                        className={`flex items-center justify-center space-x-2 w-full px-4 py-2 rounded-lg transition-colors ${
                          canResend 
                            ? 'bg-purple-600 text-white hover:bg-purple-700' 
                            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isResending ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Resending...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            <span>
                              {canResend 
                                ? 'Resend Email' 
                                : `Resend Available in ${Math.ceil((60000 - (Date.now() - (emailSentTime?.getTime() || Date.now()))) / 1000)}s`
                              }
                            </span>
                          </>
                        )}
                      </button>
                      
                      <p className="text-sm text-slate-500">
                        Still having trouble? <a href="mailto:support@coachpack.org" className="text-purple-600 hover:text-purple-700">Contact Support</a>
                      </p>
                    </div>
                  </div>
                  <Link 
                    to="/login"
                    className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Return to Login
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">Reset Your Password</h1>
                  <p className="text-slate-600">
                    Enter your email address and we'll send you a link to reset your password.
                    The link will be valid for 24 hours.
                  </p>
                </div>
                
                {emailServiceStatus === 'not-working' && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-amber-800">Email Service Notice</h3>
                      <p className="text-sm text-amber-700 mt-1">
                        Our email service may be experiencing issues. If you don't receive a reset email,
                        please contact support at <a href="mailto:support@coachpack.org" className="font-medium underline">support@coachpack.org</a>.
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>

                  {/* Back to Login */}
                  <div className="text-center">
                    <Link 
                      to="/login"
                      className="flex items-center justify-center space-x-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Login
                    </Link>
                  </div>
                </form>
                
                {/* Alternative Contact */}
                <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-700 mb-2 font-medium">Need immediate assistance?</p>
                  <p className="text-xs text-slate-600">
                    If you're unable to reset your password through email, please contact our support team
                    at <a href="mailto:support@coachpack.org" className="text-purple-600 hover:text-purple-700">support@coachpack.org</a> with
                    your account email for manual verification.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;