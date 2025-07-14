import { useContext } from 'react';
import { AuthContext } from '../AuthProvider';

// Define a more comprehensive return type
export interface UseAuthReturn {
  user: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  } | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<{ user: any; error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  clearError: () => void;
  hasAccess: () => boolean;
  isAuthenticated: boolean;
}

// Define a more comprehensive return type
export interface UseAuthReturn {
  user: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  } | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<{ user: any; error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  clearError: () => void;
  hasAccess: () => boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    // Return a mock context with default values when real context is not available
    const mockAuth: UseAuthReturn = {
      user: null,
      loading: false,
      error: null,
      signIn: async () => {},
      signUp: async () => ({ user: null, error: null }),
      signOut: async () => {},
      resetPassword: async () => {},
      updatePassword: async () => {},
      clearError: () => {},
      hasAccess: () => true, // Always return true to allow access
      isAuthenticated: false
    };
    return mockAuth;
  }
  
  // Add isAuthenticated computed property
  const isAuthenticated = !!context.user;
  
  const authContext: UseAuthReturn = {
    ...context,
    isAuthenticated
  };
  
  return authContext;
};