export interface StripeProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'complete-toolkit',
    name: 'Complete Toolkit',
    description: 'Full access to all self-coaching tools for 14 weeks',
    price: 49.00,
    currency: 'usd'
  }
];

export const getProductById = (id: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.id === id);
};