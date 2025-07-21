// Environment validation for Stripe
export const validateStripeEnvironment = () => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const priceId = import.meta.env.VITE_STRIPE_PRICE_ID;
  
  if (!publishableKey) {
    console.error('CRITICAL: Missing VITE_STRIPE_PUBLISHABLE_KEY environment variable');
    return false;
  }
  
  if (!priceId) {
    console.error('CRITICAL: Missing VITE_STRIPE_PRICE_ID environment variable');
    return false;
  }
  
  // Check if we're in production but using test keys
  if (import.meta.env.PROD && publishableKey.startsWith('pk_test_')) {
    console.error('CRITICAL: Using Stripe test keys in production. Payments will not work.');
    return false;
  }
  
  // Check if we're in development but using live keys
  if (import.meta.env.DEV && publishableKey.startsWith('pk_live_')) {
    console.warn('WARNING: Using Stripe live keys in development - real payments will be processed');
  }
  
  return true;
};

// Validate on module load but don't crash the app
try {
  const isStripeValid = validateStripeEnvironment();
  if (!isStripeValid && import.meta.env.PROD) {
    console.error('CRITICAL: Stripe is not properly configured for production');
  }
} catch (error) {
  console.error('Error validating Stripe environment:', error);
}

export interface StripeProduct {
  id: string;
  name: string;
  description: string;
  priceId: string;
  price: number;
  currency: string;
  mode: 'payment' | 'subscription';
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'complete-toolkit',
    name: 'Complete Toolkit',
    description: 'Full access to all self-coaching tools for 30 days',
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID || '',
    price: 50.00,
    currency: 'usd',
    mode: 'payment'
  }
];

export const getProductById = (id: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.id === id);
};