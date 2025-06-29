import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAccess?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresAccess = false 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Skip authentication check - allow direct access to dashboard
  return <>{children}</>;
};

export default ProtectedRoute;