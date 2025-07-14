import React, { createContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Define types for auth error handling
interface AuthError {
  message: string;
  status?: number;
}

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.");
}

// Create Supabase client with validated environment variables
const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

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
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  clearError: () => void;
  hasAccess: () => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

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
      } else {
        console.error('AuthProvider: No user returned from sign in');
        throw new Error('Sign in failed. Please try again.');
      }
    } catch (err) {
      console.error('AuthProvider: Sign in exception:', err);
      setError(err instanceof Error ? err.message : 'Sign in failed');
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
          name: name || data.user.email!.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`
        };
        
        setUser({
          id: data.user.id,
          email: data.user.email!,
          name: name || data.user.email!.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`
        });
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
  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('AuthProvider: Attempting to send password reset email to:', email);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
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
    // For now, return true to allow access to all features
    // In a production app, you would check subscription status
    return true;
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
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
        } else {
          console.log('AuthProvider: No existing session found');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthProvider: Auth state changed:', event);
      if (session?.user) {
        console.log('AuthProvider: User authenticated:', session.user.id);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.full_name,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`
        });
      } else {
        console.log('AuthProvider: User signed out or session expired');
        setUser(null);
      }
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
    hasAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;