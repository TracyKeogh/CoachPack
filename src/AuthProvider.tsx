import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase, testConnection, createUserProfile, checkUserProfile, testEmailService as testSupabaseEmail } from './utils/supabase-setup';

// Define types for auth error handling
interface AuthError {
  message: string;
  status?: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string, redirectTo?: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  clearError: () => void,
  hasAccess: () => boolean,
  testEmailService: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [connectionTested, setConnectionTested] = useState<boolean>(false);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Format error message
  const formatError = useCallback((error: AuthError): string => {
    // Handle specific error codes
    if (error.message.includes('User already registered')) {
      return 'This email is already registered. Please sign in instead.';
    }
    
    if (error.message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
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
        throw new Error(formatError(error));
      }

      if (data.user) {
        // Successfully signed in
        console.log('AuthProvider: Sign in successful for user:', data.user.id);
        setUser({
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata.full_name,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`
        });
        
        // Check if user profile exists, create if not
        const profileExists = await checkUserProfile(data.user.id);
        if (!profileExists) {
          console.log('AuthProvider: Profile not found, creating one');
          const { success, error: profileError } = await createUserProfile(
            data.user.id,
            data.user.email!,
            data.user.user_metadata.full_name
          );
          if (!success && profileError)
            console.warn('AuthProvider: Failed to create profile, but login successful:', profileError);
        }
      } else {
        console.error('AuthProvider: No user returned from sign in');
        throw new Error('Sign in failed. Please try again.');
      }
    } catch (err) {
      console.error('AuthProvider: Sign in exception:', err);
      setError(err instanceof Error ? err.message : 'Sign in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formatError]);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, name?: string): Promise<{ user: User | null; error: Error | null }> => {
    setLoading(true);
    setError(null);
    let resultUser: User | null = null;
    let resultError: Error | null = null;

    // Retry mechanism for network issues
    const maxRetries = 2;
    let retryCount = 0;
    let success = false;

    while (!success && retryCount <= maxRetries) {
      if (retryCount > 0) {
        console.log(`AuthProvider: Retry attempt ${retryCount} for sign up`);
      }
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
        success = true;
        console.log('AuthProvider: Sign up successful for user:', data.user.id);
        resultUser = {
          id: data.user.id,
          email: data.user.email!,
          name: name || data.user.email!.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`
        };
        
        setUser({
          id: data.user.id,
          email: data.user.email!,
          name: name || data.user.email!.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`
        });
        
        // Create user profile
        try {
          console.log('AuthProvider: Creating user profile after signup');
          const { success: profileSuccess, error: profileError } = await createUserProfile(
            data.user.id,
            data.user.email!,
            name || data.user.email!.split('@')[0]
          );
          if (!profileSuccess && profileError) {
            console.warn('AuthProvider: Failed to create profile, but signup successful:', profileError);
          }
        } catch (profileErr) {
          console.warn('AuthProvider: Exception creating profile:', profileErr);
        }
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
      
      // Only retry for network-related errors
      if (err instanceof Error && (
        err.message.includes('network') || 
        err.message.includes('connection') ||
        err.message.includes('timeout')
      )) {
        retryCount++;
      } else {
        resultError = err instanceof Error ? err : new Error('Sign up failed');
        break;
      }
    } finally {
      setLoading(false);
    }
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
  }, [formatError]);

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
      
      // Add redirectTo if provided
      if (redirectTo) {
        options.redirectTo = redirectTo;
        console.log('AuthProvider: Using redirect URL:', redirectTo);
      } else {
        // Default redirect to reset-password page on current origin
        options.redirectTo = `${window.location.origin}/reset-password`;
        console.log('AuthProvider: Using default redirect URL:', options.redirectTo);
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, options);
      
      if (error) {
        console.error('AuthProvider: Password reset error:', error);
        throw new Error(formatError(error));
      }
      
      console.log('AuthProvider: Password reset email sent successfully');
      
      // Log additional information for debugging
      if (import.meta.env.DEV) {
        console.log('AuthProvider: In development mode - password reset details:');
        console.log('- Email:', email);
        console.log('- Redirect URL:', options.redirectTo);
        console.log('- Origin:', window.location.origin);
        console.log('- Check Supabase logs for email delivery status');
      }
    } catch (err) {
      console.error('AuthProvider: Password reset exception:', err);
      setError(err instanceof Error ? err.message : 'Password reset failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formatError, connectionTested]);
  
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
        console.error('AuthProvider: Update password error:', error);
        throw new Error(formatError(error));
      }
      
      console.log('AuthProvider: Password updated successfully');
    } catch (err) {
      console.error('AuthProvider: Update password exception:', err);
      setError(err instanceof Error ? err.message : 'Password update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formatError]);
  
  // Check if user has access to premium features
  const hasAccess = useCallback(() => {
    // For now, return true to allow access to all features
    // In a production app, you would check subscription status
    return true;
  }, []);
  
  // Test email service
  const testEmailService = useCallback(async (): Promise<boolean> => {
    try {
      // First check if we can connect to Supabase
      if (!connectionTested) {
        const isConnected = await testConnection();
        if (!isConnected) {
          console.error('AuthProvider: Cannot test email service - Supabase connection failed');
          return false;
        }
      }
      
      // Use the utility function to test email service
      const isWorking = await testSupabaseEmail();
      return isWorking;
    } catch (error) {
      console.error('AuthProvider: Error testing email service:', error);
      return false;
    }
  }, [connectionTested]);


  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      try {
        console.log('AuthProvider: Checking for existing session');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('AuthProvider: Found existing session for user:', session.user.id);
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.full_name,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`
          });
          
          // Check if user profile exists, create if not
          try {
            const profileExists = await checkUserProfile(session.user.id);
            if (!profileExists) {
              console.log('AuthProvider: Profile not found for existing session, creating one');
              await createUserProfile(
                session.user.id,
                session.user.email!,
                session.user.user_metadata.full_name
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
      } finally {
        setLoading(false);
        setConnectionTested(true);
        setInitialized(true);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setLoading(true);
      console.log('AuthProvider: Auth state changed:', event);
      if (session?.user) {
        console.log('AuthProvider: User authenticated:', session.user.id);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.full_name,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`
        });
        
        // Check if user profile exists, create if not
        checkUserProfile(session.user.id).then(exists => {
          if (!exists) {
            console.log('AuthProvider: Profile not found after auth change, creating one');
            createUserProfile(
              session.user.id,
              session.user.email!,
              session.user.user_metadata.full_name
            ).catch(err => {
              console.warn('AuthProvider: Error creating profile after auth change:', err);
            });
          }
        });
      } else {
        console.log('AuthProvider: User signed out or session expired');
        setUser(null);
      }
      setLoading(false);
      setInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    clearError,
    hasAccess,
    testEmailService
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;