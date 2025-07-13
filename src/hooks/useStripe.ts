// This is a placeholder file to maintain imports
// The actual Stripe integration has been removed in favor of a frontend-only approach

export const useStripe = () => {
  return {
    loading: false,
    error: null,
    redirectToCheckout: async () => {
      console.log('Stripe checkout redirect is disabled - using frontend-only approach');
      return Promise.resolve();
    },
    hasValidAccess: async () => {
      return Promise.resolve(true);
    }
  };
};