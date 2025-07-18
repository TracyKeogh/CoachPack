import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, testSupabaseConnection, saveUser } from './lib/supabase';
import type { User } from '@supabase/supabase-js';

// Define our User type
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  hasValidSubscription?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string, redirectTo?: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<void>;
  clearError: () => void;
  hasAccess: boolean;
  testEmailService: () => Promise<void>;
  checkSubscription: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [connectionTested, setConnectionTested] = useState(false);

  // Test connection
  const testConnection = useCallback(async () => {
    try {
      console.log('AuthProvider: Testing Supabase connection...');
      return await testSupabaseConnection();
    } catch (error) {
      console.error('AuthProvider: Connection test failed:', error);
      return false;
    }
  }, []);

  // Check if user profile exists
  const checkUserProfile = useCallback(async (userId: string): Promise<boolean> => {
    try {
      console.log('AuthProvider: Checking if user profile exists for user:', userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.log('AuthProvider: User profile check error:', error);
        return false;
      }

      const exists = !!data;
      console.log('AuthProvider: User profile exists:', exists);
      return exists;
    } catch (error) {
      console.error('AuthProvider: Exception checking user profile:', error);
      return false;
    }
  }, []);

  // Create user profile
  const createUserProfile = useCallback(async (userId: string, email: string, name: string): Promise<{ success: boolean; error: Error | null }> => {
    try {
      console.log('AuthProvider: Creating user profile for user:', userId);
      const { data, error } = await saveUser(email, name);
      
      if (error) {
        console.error('AuthProvider: Error creating user profile:', error);
        return { success: false, error };
      }

      console.log('AuthProvider: User profile created successfully:', data);
      return { success: true, error: null };
    } catch (error) {
      console.error('AuthProvider: Exception creating user profile:', error);
      return { success: false, error: error as Error };
    }
  }, []);

  // Check user subscription status
  const checkSubscription = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      console.log('AuthProvider: Checking subscription status for user:', user.id);
      
      // Check if user has an active subscription
      const { data: subscriptionData, error: subError } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status')
        .eq('customer_id', user.id)
        .eq('subscription_status', 'active')
        .maybeSingle(); // Use maybeSingle instead of single to handle no results

      if (subError) {
        console.error('AuthProvider: Subscription check error:', subError);
        return false;
      }

      // Check if user has completed orders (one-time payments)
      const { data: orderData, error: orderError } = await supabase
        .from('stripe_user_orders')
        .select('order_status')
        .eq('customer_id', user.id)
        .eq('order_status', 'completed')
        .limit(1);

      if (orderError) {
        console.error('AuthProvider: Order check error:', orderError);
        return false;
      }

      const hasValidSubscription = !!(subscriptionData || (orderData && orderData.length > 0));
      console.log('AuthProvider: User has valid subscription/payment:', hasValidSubscription);
      
      return hasValidSubscription;
    } catch (error) {
      console.error('AuthProvider: Exception checking subscription:', error);
      return false;
    }
  }, [user]);

  // Test email service
  const testEmailService = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('AuthProvider: Testing email service...');
      // This would call your email service test endpoint
      // For now, we'll just simulate success
      console.log('AuthProvider: Email service test completed');
    } catch (error) {
      console.error('AuthProvider: Email service test failed:', error);
      setError('Email service test failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Format error messages
  const formatError = useCallback((error: any) => {
    if (error.message?.includes('email rate limit exceeded') || error.message?.includes('over_email_send_rate_limit')) {
      return 'Email sending limit reached. Please wait 10-15 minutes before trying again, or contact support if this persists.';
    }
    if (error.message?.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (error.message?.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    if (error.message?.includes('User already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (error.message?.includes('Password should be at least 6 characters')) {
      return 'Password must be at least 6 characters long.';
    }
    
    // Return the original message if no specific handling
    return error.message;
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // Test connection first
      if (!connectionTested) {
        const isConnected = await testConnection();
        setConnectionTested(true);
        if (!isConnected) {
          throw new Error('Unable to connect to Supabase. Please check your internet connection and try again.');
        }
      }
      
      console.log('AuthProvider: Attempting to sign in with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('AuthProvider: Sign in error:', error);
        // Ensure we always throw so the form spinner stops and errors are shown
        throw new Error(formatError(error));
      }

      if (data.user) {
        // Successfully signed in
        console.log('AuthProvider: Sign in successful for user:', data.user.id);
        const newUser = {
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata.full_name || data.user.email!.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`
        };
        
        setUser(newUser);
        
        // Check if user profile exists, create if not
        const profileExists = await checkUserProfile(data.user.id);
        if (!profileExists) {
          console.log('AuthProvider: Profile not found, creating one');
          const { success, error: profileError } = await createUserProfile(
            data.user.id,
            data.user.email!,
            data.user.user_metadata.full_name || data.user.email!.split('@')[0]
          );
          if (!success && profileError)
            console.warn('AuthProvider: Failed to create profile, but login successful:', profileError);
        }
      } else {
        console.error('AuthProvider: No user returned from sign in');
        // Always throw if no user is returned
        throw new Error('Sign in failed. Please try again.');
      }
    } catch (err) {
      console.error('AuthProvider: Sign in exception:', err);
      setError(err instanceof Error ? err.message : 'Sign in failed');
      // Always rethrow so the form knows to stop the spinner
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formatError, testConnection, checkUserProfile, createUserProfile]);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, name?: string): Promise<{ user: User | null; error: Error | null }> => {
    setLoading(true);
    setError(null);
    let resultUser: User | null = null;
    let resultError: Error | null = null;

    try {
      console.log('AuthProvider: Attempting to sign up with email:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name || ''
          }
        }
      });

      if (error) {
        console.error('AuthProvider: Sign up error:', error);
        
        const formattedError = new Error(formatError(error));
        setError(formattedError.message);
        resultError = formattedError;
        return { user: null, error: formattedError };
      }

      if (data.user) {
        console.log('AuthProvider: Sign up successful for user:', data.user.id);
        resultUser = {
          id: data.user.id,
          email: data.user.email!,
          full_name: name || data.user.email!.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`
        };
        
        // Don't set user state or create profile yet
        // This will be handled by the auth state listener after email verification
        console.log('AuthProvider: User signup successful, waiting for email verification');
        
      } else {
        console.error('AuthProvider: No user returned from sign up');
        const noUserError = new Error('Sign up failed. Please try again.');
        setError(noUserError.message);
        resultError = noUserError;
        return { user: null, error: noUserError };
      }
    } catch (err) {
      console.error('AuthProvider: Sign up exception:', err);
      setError(err instanceof Error ? err.message : 'Sign up failed');
      resultError = err instanceof Error ? err : new Error('Sign up failed');
    } finally {
      setLoading(false);
    }
    
    return { user: resultUser, error: resultError };
  }, [formatError]);

  // Sign out
  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Test connection first
      if (!connectionTested) {
        const isConnected = await testConnection();
        setConnectionTested(true);
        if (!isConnected) {
          throw new Error('Unable to connect to Supabase. Please check your internet connection and try again.');
        }
      }
      console.log('AuthProvider: Attempting to sign out');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AuthProvider: Sign out error:', error);
        throw new Error(formatError(error));
      }

      console.log('AuthProvider: Sign out successful');
      setUser(null);
    } catch (err) {
      console.error('AuthProvider: Sign out exception:', err);
      setError(err instanceof Error ? err.message : 'Sign out failed');
    } finally {
      setLoading(false);
    }
  }, [formatError, testConnection]);

  // Reset password
  const resetPassword = useCallback(async (email: string, redirectTo?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Test connection first
      if (!connectionTested) {
        const isConnected = await testConnection();
        setConnectionTested(true);
        if (!isConnected) {
          throw new Error('Unable to connect to Supabase. Please check your internet connection and try again.');
        }
      }
      console.log('AuthProvider: Attempting to send password reset email to:', email);
      
      const options: { redirectTo?: string } = {};
      if (redirectTo) {
        options.redirectTo = redirectTo;
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, options);
      
      if (error) {
        console.error('AuthProvider: Password reset error:', error);
        throw new Error(formatError(error));
      }

      console.log('AuthProvider: Password reset email sent successfully');
    } catch (err) {
      console.error('AuthProvider: Password reset exception:', err);
      setError(err instanceof Error ? err.message : 'Password reset failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formatError, testConnection]);

  // Update password
  const updatePassword = useCallback(async (password: string) => {
    setLoading(true);
    setError(null);

    try {
      // Test connection first
      if (!connectionTested) {
        const isConnected = await testConnection();
        setConnectionTested(true);
        if (!isConnected) {
          throw new Error('Unable to connect to Supabase. Please check your internet connection and try again.');
        }
      }
      console.log('AuthProvider: Attempting to update password');
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error('AuthProvider: Password update error:', error);
        throw new Error(formatError(error));
      }

      console.log('AuthProvider: Password updated successfully');
    } catch (err) {
      console.error('AuthProvider: Password update exception:', err);
      setError(err instanceof Error ? err.message : 'Password update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formatError, testConnection]);

  // Resend confirmation email
  const resendConfirmationEmail = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      // Test connection first
      if (!connectionTested) {
        const isConnected = await testConnection();
        setConnectionTested(true);
        if (!isConnected) {
          throw new Error('Unable to connect to Supabase. Please check your internet connection and try again.');
        }
      }
      console.log('AuthProvider: Attempting to resend confirmation email to:', email);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) {
        console.error('AuthProvider: Resend confirmation error:', error);
        throw new Error(formatError(error));
      }

      console.log('AuthProvider: Confirmation email resent successfully');
    } catch (err) {
      console.error('AuthProvider: Resend confirmation exception:', err);
      setError(err instanceof Error ? err.message : 'Failed to resend confirmation email');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formatError, testConnection]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if user has access to paid features
  const hasAccess = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    return await checkSubscription();
  }, [user, checkSubscription]);

  // Initialize authentication
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        
        // Test connection first
        const isConnected = await testConnection();
        setConnectionTested(true);
        if (!isConnected) {
          console.error('AuthProvider: Unable to connect to Supabase');
          setLoading(false); // Ensure loading is reset on early return
          return;
        }
        
        console.log('AuthProvider: Checking existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Session check error:', error);
          setLoading(false); // Ensure loading is reset on early return
          return;
        }

        if (session?.user) {
          console.log('AuthProvider: Existing session found for user:', session.user.id);
          const newUser = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.full_name || session.user.email!.split('@')[0],
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`
          };
          setUser(newUser);
          
          // Check if user profile exists, create if not
          try {
            const profileExists = await checkUserProfile(session.user.id);
            if (!profileExists) {
              console.log('AuthProvider: Profile not found for existing session, creating one');
              await createUserProfile(
                session.user.id,
                session.user.email!,
                session.user.user_metadata.full_name || session.user.email!.split('@')[0]
              );
            }
          } catch (profileError) {
            console.warn('AuthProvider: Error checking/creating profile for existing session:', profileError);
          }
        } else {
          console.log('AuthProvider: No existing session found');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setLoading(false); // Ensure loading is reset on error
      } finally {
        setLoading(false);
        setConnectionTested(true);
        setInitialized(true);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      console.log('AuthProvider: Auth state changed:', event);
      
      if (session?.user) {
        console.log('AuthProvider: User authenticated:', session.user.id);
        const newUser = {
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata.full_name || session.user.email!.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`
        };
        setUser(newUser);
        
        // Only create profile if user is verified (for new signups)
        if (event === 'SIGNED_IN' && session.user.email_confirmed_at) {
          try {
            const profileExists = await checkUserProfile(session.user.id);
            if (!profileExists) {
              console.log('AuthProvider: Profile not found after auth change, creating one');
              await createUserProfile(
                session.user.id,
                session.user.email!,
                session.user.user_metadata.full_name || session.user.email!.split('@')[0]
              );
            }
          } catch (profileError) {
            console.warn('AuthProvider: Error checking/creating profile after auth change:', profileError);
          }
        }
      } else {
        console.log('AuthProvider: User signed out or session expired');
        setUser(null);
      }
      setLoading(false);
      setInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, [testConnection, checkUserProfile, createUserProfile]);

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    resendConfirmationEmail,
    clearError,
    hasAccess,
    testEmailService,
    checkSubscription
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;