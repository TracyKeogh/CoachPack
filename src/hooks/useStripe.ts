import { useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { STRIPE_PRODUCTS } from '../stripe-config';

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

  const createCheckoutSession = useCallback(async (productId: string): Promise<{ sessionId: string; url: string } | null> => {
    setLoading(true);
    setError(null);

    try {
      const product = STRIPE_PRODUCTS.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Call the Supabase Edge Function to create a checkout session
      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          price_id: product.priceId,
          mode: product.mode,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/cancel`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      return data;
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
    try {
      // Check if the user has an active subscription or valid access
      const { data, error } = await supabase
        .from('user_profiles')
        .select('subscription_status, subscription_expires_at')
        .single();
      
      if (error) {
        console.error('Error checking subscription status:', error);
        return false;
      }
      
      if (!data) return false;
      
      // Check if user has a valid subscription
      if (data.subscription_status === 'pro' || data.subscription_status === 'lifetime') {
        // For lifetime subscriptions, check if it's still valid
        if (data.subscription_status === 'lifetime' && data.subscription_expires_at) {
          const expiresAt = new Date(data.subscription_expires_at);
          if (expiresAt < new Date()) {
            return false;
          }
        }
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error checking access:', err);
      return false;
    }
  }, []);

  return {
    loading,
    error,
    createCheckoutSession,
    redirectToCheckout,
    hasValidAccess,
  };
};