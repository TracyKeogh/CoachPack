import { useState, useEffect } from 'react';

interface WheelSignup {
  email: string;
  signupTime: string;
  hasAccess: boolean;
}

export const useWheelSignup = () => {
  const [signup, setSignup] = useState<WheelSignup | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already signed up
    const email = localStorage.getItem('wheel-signup-email');
    const signupTime = localStorage.getItem('wheel-signup-time');
    
    if (email && signupTime) {
      setSignup({
        email,
        signupTime,
        hasAccess: true
      });
    }
    
    setIsLoading(false);
  }, []);

  const createSignup = async (email: string): Promise<boolean> => {
    try {
      // Store in localStorage for demo
      localStorage.setItem('wheel-signup-email', email);
      localStorage.setItem('wheel-signup-time', new Date().toISOString());
      
      setSignup({
        email,
        signupTime: new Date().toISOString(),
        hasAccess: true
      });
      
      return true;
    } catch (error) {
      console.error('Failed to create wheel signup:', error);
      return false;
    }
  };

  const updateWheelData = async (wheelData: any): Promise<boolean> => {
    try {
      // Store it locally
      localStorage.setItem('wheel-signup-data', JSON.stringify(wheelData));
      return true;
    } catch (error) {
      console.error('Failed to update wheel data:', error);
      return false;
    }
  };

  // Always return true to allow access without sign-in
  const hasWheelAccess = (): boolean => {
    return true;
  };

  return {
    signup,
    isLoading,
    createSignup,
    updateWheelData,
    hasWheelAccess
  };
};