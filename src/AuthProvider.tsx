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
  clearError: () => void;
  hasAccess: () => boolean;
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

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Format error message
  const formatError = useCallback((error: AuthError): string => {
    if (error.message.includes('User already registered')) {
      return 'This email is already registered. Please sign in instead.';
    }
    
    if (error.message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    
    return error.message;
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
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
        console.log('AuthProvider: Sign in successful for user:', data.user.id);
        setUser({
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata.full_name,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`
        });
        
        // Check if user profile exists, create if not
        try {
          const profileExists = await checkUserProfile(data.user.id);
          if (!profileExists) {
            console.log('AuthProvider: Profile not found, creating one');
            const { success, error: profileError } = await createUserProfile(
              data.user.id,
              data.user.email!,
              data.user.user_metadata.full_name
            );
            if (!success && profileError) {
              console.warn('AuthProvider: Failed to create profile, but login successful:', profileError);
            }
          }
        } catch (profileErr) {
          console.warn('AuthProvider: Profile check/creation failed, but login successful:', profileErr);
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
  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('AuthProvider: Attempting to sign up with email:', email);
      
      // Use the current origin for redirect
      const confirmationRedirectTo = `${window.location.origin}/auth/login`;
      console.log('AuthProvider: Using confirmation redirect URL:', confirmationRedirectTo);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name || email.split('@')[0]
          },
          emailRedirectTo: confirmationRedirectTo
        }
      });

      if (error) {
        console.error('AuthProvider: Sign up error:', error);
        throw new Error(formatError(error));
      }

      if (data.user) {
        console.log('AuthProvider: Sign up successful for user:', data.user.id);
        console.log('AuthProvider: User created in Supabase:', data.user);
        console.log('AuthProvider: Email confirmation required:', !data.user.email_confirmed_at);
        
        // Create user profile
        try {
          const { success, error: profileError } = await createUserProfile(
            data.user.id,
            data.user.email!,
            name || data.user.email!.split('@')[0]
          );
          
          if (!success && profileError) {
            console.error('AuthProvider: Failed to create profile during signup:', profileError);
            // Don't throw here - user was created successfully in auth
          } else {
            console.log('AuthProvider: User profile created successfully');
          }
        } catch (profileErr) {
          console.warn('AuthProvider: Profile creation failed during signup:', profileErr);
          // Don't throw here - user was created successfully in auth
        }
        
        // Return the user data for the signup page to handle
        return { user: data.user, session: data.session };
      } else {
        console.error('AuthProvider: No user returned from sign up');
        throw new Error('Sign up failed. Please try again.');
      }
    } catch (err) {
      console.error('AuthProvider: Sign up exception:', err);
      setError(err instanceof Error ? err.message : 'Sign up failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formatError]);

  // Sign out
  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
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
      console.log('AuthProvider: Attempting to send password reset email to:', email);
      
      const options: { redirectTo?: string } = {};
      
      if (redirectTo) {
        options.redirectTo = redirectTo;
        console.log('AuthProvider: Using redirect URL:', redirectTo);
      } else {
        options.redirectTo = `${window.location.origin}/reset-password`;
        console.log('AuthProvider: Using default redirect URL:', options.redirectTo);
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, options);
      
      if (error) {
        console.error('AuthProvider: Password reset error:', error);
        throw new Error(formatError(error));
      }
      
      console.log('AuthProvider: Password reset email sent successfully');
      
      if (import.meta.env.DEV) {
        console.log('AuthProvider: In development mode - password reset details:', {
          email,
          redirectTo: options.redirectTo,
          origin: window.location.origin
        });
      }
    } catch (err) {
      console.error('AuthProvider: Password reset exception:', err);
      setError(err instanceof Error ? err.message : 'Password reset failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formatError]);
  
  // Update password
  const updatePassword = useCallback(async (password: string) => {
    setLoading(true);
    setError(null);
    
    try {
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
    return true; // For now, allow access to all features
  }, []);
  
  // Test email service
  const testEmailService = useCallback(async (): Promise<boolean> => {
    try {
      const isWorking = await testSupabaseEmail();
      return isWorking;
    } catch (error) {
      console.error('AuthProvider: Error testing email service:', error);
      return false;
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('AuthProvider: Starting session check');
        console.log('AuthProvider: Checking for existing session');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('AuthProvider: Found existing session for user:', session.user.id);
          console.log('AuthProvider: User email:', session.user.email);
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.full_name,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`
          });
        } else {
          console.log('AuthProvider: No existing session found');
        }
      } catch (err) {
        console.error('AuthProvider: Session check error:', err);
        // Don't set error state for session check failures
      } finally {
        console.log('AuthProvider: Session check complete, setting initialized=true, loading=false');
        setInitialized(true);
        setLoading(false);
      }
    };

    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state change:', event, session?.user?.id);
        console.log('AuthProvider: Full auth state change details:', { event, hasSession: !!session, hasUser: !!session?.user });
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('AuthProvider: Processing SIGNED_IN event');
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.full_name,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`
          });
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthProvider: Processing SIGNED_OUT event');
          setUser(null);
        }
        
        if (initialized) {
          console.log('AuthProvider: Setting loading=false (initialized=true)');
          setLoading(false);
        }
      }
    );

    return () => {
      console.log('AuthProvider: Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, [initialized]);

  const value: AuthContextType = {
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;