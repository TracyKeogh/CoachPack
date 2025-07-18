import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabaseClient'; // Adjust import path as needed

interface AuthContextType {
  user: any;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<any>;
  loading: boolean;
  isSupabaseConnected: boolean;
  connectionWarning: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Environment detection utilities
const detectEnvironment = () => {
  const hostname = window.location.hostname;
  const userAgent = navigator.userAgent;
  
  // Common online sandbox patterns
  const sandboxPatterns = [
    /bolt\.new/,
    /stackblitz\.io/,
    /codesandbox\.io/,
    /replit\.com/,
    /codepen\.io/,
    /jsbin\.com/,
    /jsfiddle\.net/,
    /webcontainer/i,
    /localhost/,
    /127\.0\.0\.1/,
    /192\.168\./,
    /10\./,
    /172\.16\./
  ];
  
  const isSandbox = sandboxPatterns.some(pattern => 
    pattern.test(hostname) || pattern.test(userAgent)
  );
  
  // Additional checks for common sandbox environments
  const isWebContainer = 'webcontainer' in window || userAgent.includes('WebContainer');
  const isStackBlitz = hostname.includes('stackblitz') || window.location.origin.includes('stackblitz');
  const isBolt = hostname.includes('bolt.new') || window.location.origin.includes('bolt.new');
  
  return {
    isSandbox: isSandbox || isWebContainer || isStackBlitz || isBolt,
    isProduction: process.env.NODE_ENV === 'production' && !isSandbox,
    isDevelopment: process.env.NODE_ENV === 'development' || isSandbox,
    environment: isBolt ? 'bolt' : isStackBlitz ? 'stackblitz' : isSandbox ? 'sandbox' : 'standard'
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [connectionWarning, setConnectionWarning] = useState<string | null>(null);
  
  const env = detectEnvironment();

  // Enhanced connection test with environment-specific behavior
  const testSupabaseConnection = async (): Promise<boolean> => {
    try {
      console.log(`[AuthProvider] Testing Supabase connection in ${env.environment} environment...`);
      
      // In sandbox environments, use a much shorter timeout
      const timeoutMs = env.isSandbox ? 3000 : 10000;
      
      const connectionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), timeoutMs)
      );
      
      await Promise.race([connectionPromise, timeoutPromise]);
      console.log('[AuthProvider] Supabase connection successful');
      return true;
      
    } catch (error) {
      console.warn('[AuthProvider] Supabase connection failed:', error);
      
      if (env.isSandbox) {
        setConnectionWarning(
          `⚠️ Running in ${env.environment} environment - Supabase may be unreachable. UI is available for design/testing purposes.`
        );
      } else {
        setConnectionWarning('Unable to connect to authentication service. Please check your connection.');
      }
      
      return false;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      console.log(`[AuthProvider] Initializing auth in ${env.environment} environment...`);
      
      // In sandbox environments, skip connection test or make it non-blocking
      if (env.isSandbox) {
        console.log('[AuthProvider] Sandbox environment detected - using relaxed connection test');
        
        // Start connection test but don't block the UI
        testSupabaseConnection().then(connected => {
          setIsSupabaseConnected(connected);
          if (!connected) {
            console.log('[AuthProvider] Supabase unreachable in sandbox - continuing with mock state');
          }
        });
        
        // Set loading to false immediately in sandbox environments
        setLoading(false);
        
        // Try to get session if possible, but don't block
        try {
          const { data: { session } } = await supabase.auth.getSession();
          setUser(session?.user ?? null);
        } catch (error) {
          console.log('[AuthProvider] Could not get session in sandbox:', error);
          setUser(null);
        }
        
      } else {
        // Production/standard environment - run full connection test
        const connected = await testSupabaseConnection();
        setIsSupabaseConnected(connected);
        
        if (connected) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
          } catch (error) {
            console.error('[AuthProvider] Error getting session:', error);
            setUser(null);
          }
        }
        
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener (only if not in sandbox or if connection works)
    let authListener: any = null;
    
    if (!env.isSandbox || isSupabaseConnected) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('[AuthProvider] Auth state changed:', event);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );
      authListener = subscription;
    }

    return () => {
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, [env.isSandbox, isSupabaseConnected]);

  // Auth methods with sandbox-aware error handling
  const signIn = async (email: string, password: string) => {
    try {
      if (env.isSandbox && !isSupabaseConnected) {
        // In sandbox without connection, simulate success for UI testing
        console.log('[AuthProvider] Simulating sign-in in sandbox environment');
        setUser({ email, id: 'sandbox-user' });
        return { data: { user: { email, id: 'sandbox-user' } }, error: null };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { data, error: null };
      
    } catch (error) {
      console.error('[AuthProvider] Sign-in error:', error);
      
      if (env.isSandbox) {
        // In sandbox, show friendly error but don't block UI
        return { 
          data: null, 
          error: { message: 'Sign-in unavailable in sandbox environment' } 
        };
      }
      
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      if (env.isSandbox && !isSupabaseConnected) {
        console.log('[AuthProvider] Simulating sign-up in sandbox environment');
        return { 
          data: { user: { email, id: 'sandbox-user' } }, 
          error: null 
        };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      return { data, error: null };
      
    } catch (error) {
      console.error('[AuthProvider] Sign-up error:', error);
      
      if (env.isSandbox) {
        return { 
          data: null, 
          error: { message: 'Sign-up unavailable in sandbox environment' } 
        };
      }
      
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      if (env.isSandbox && !isSupabaseConnected) {
        console.log('[AuthProvider] Simulating sign-out in sandbox environment');
        setUser(null);
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
    } catch (error) {
      console.error('[AuthProvider] Sign-out error:', error);
      
      if (env.isSandbox) {
        // In sandbox, clear user state regardless
        setUser(null);
      }
    }
  };

  const value: AuthContextType = {
    user,
    signIn,
    signOut,
    signUp,
    loading,
    isSupabaseConnected,
    connectionWarning,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};