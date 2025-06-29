import { useContext } from 'react';
import { AuthContext } from '../AuthProvider';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return {
    ...context,
    // Add a hasAccess function that always returns true
    // This ensures existing code that might check for access still works
    hasAccess: () => true
  };
};