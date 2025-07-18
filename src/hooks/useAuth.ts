import { useContext } from 'react';
import { AuthContext } from '../AuthProvider';

// Define a comprehensive return type
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
  signUp: (email: string, password: string, name?: string) => Promise<{ user: any; session: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string, redirectTo?: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  clearError: () => void;
  hasAccess: () => boolean;
  testEmailService: () => Promise<boolean>;
  isAuthenticated: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Add isAuthenticated computed property
  const isAuthenticated = !!context.user;
  
  return {
    ...context,
    isAuthenticated
  };
};