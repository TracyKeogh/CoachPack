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
    priceId: 'price_1Rf0j2GR1TepVbUMoQMYDXgT',
    price: 50.00,
    currency: 'usd',
    mode: 'payment'
  }
];

export const getProductById = (id: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.id === id);
};

// Validation function
export const validateStripeEnvironment = (): { valid: boolean; error?: string } => {
  const priceId = import.meta.env.VITE_STRIPE_PRICE_ID;
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!priceId) {
    return { valid: false, error: 'VITE_STRIPE_PRICE_ID is missing' };
  }
  
  if (!publishableKey) {
    return { valid: false, error: 'VITE_STRIPE_PUBLISHABLE_KEY is missing' };
  }
  
  return { valid: true };
};