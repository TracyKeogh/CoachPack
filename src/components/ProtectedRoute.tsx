import React, { useEffect, useState } from 'react';
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
  const { user, loading, hasAccess } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Check if user is authenticated
      if (!user) {
        setHasPermission(false);
      } else if (requiresAccess) {
        // Check if user has access to premium features
        setHasPermission(hasAccess());
      } else {
        // User is authenticated and no special access is required
        setHasPermission(true);
      }
      setIsChecking(false);
    }
  }, [user, loading, requiresAccess, hasAccess]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    // Redirect to login if not authenticated
    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // Redirect to pricing if authenticated but doesn't have required access
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;