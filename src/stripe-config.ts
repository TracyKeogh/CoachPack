// Environment validation for Stripe
const validateStripeEnvironment = () => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    console.error('PRODUCTION ERROR: Missing VITE_STRIPE_PUBLISHABLE_KEY environment variable');
    return false;
  }
  
  // Check if we're in production but using test keys
  if (import.meta.env.PROD && publishableKey.startsWith('pk_test_')) {
    console.error('PRODUCTION ERROR: Using Stripe test keys in production. Please configure live keys.');
    return false;
  }
  
  // Check if we're in development but using live keys
  if (import.meta.env.DEV && publishableKey.startsWith('pk_live_')) {
    console.warn('WARNING: Using Stripe live keys in development environment');
  }
  
  return true;
};

// Validate on module load
validateStripeEnvironment();

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
    priceId: import.meta.env.PROD 
      ? 'price_1QdVXXXXXXXXXXXXXXXXXXXX' // Replace with your actual LIVE Stripe price ID
      : 'price_1OvXXXXXXXXXXXXXXXXXXXXX', // Test price ID for development
    price: 50.00,
    currency: 'usd',
    mode: 'payment'
  }
];

export const getProductById = (id: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.id === id);
};