import { useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

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

export const useStripe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For demo purposes, we'll simulate a successful checkout
  const createCheckoutSession = useCallback(async (productId: string) => {
    setLoading(true);
    setError(null);

    try {
      // In a real app, you would call your Supabase Edge Function here
      // to create a Stripe checkout session
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return mock data
      return {
        sessionId: 'mock_session_id',
        url: '/checkout?productId=' + productId
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const redirectToCheckout = useCallback(async (productId: string): Promise<void> => {
    const session = await createCheckoutSession(productId);
    
    if (session?.url) {
      window.location.href = session.url;
    }
  }, [createCheckoutSession]);

  const hasValidAccess = useCallback(async (): Promise<boolean> => {
    // In a real app, you would check if the user has an active subscription
    // or a recent one-time purchase
    
    // For demo purposes, we'll return true
    return true;
  }, []);

  return {
    loading,
    error,
    createCheckoutSession,
    redirectToCheckout,
    hasValidAccess,
  };
};