import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, hasAccess } = useAuth();
  const [hasValidSubscription, setHasValidSubscription] = useState<boolean | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  console.log('ProtectedRoute: Rendering with state:', { 
    hasUser: !!user, 
    loading, 
    hasValidSubscription, 
    checkingSubscription 
  });
  useEffect(() => {
    const verifySubscription = async () => {
      if (user && !loading) {
        console.log('ProtectedRoute: Verifying subscription for user:', user.id);
        setCheckingSubscription(true);
        try {
          const accessResult = await hasAccess();
          console.log('ProtectedRoute: Access result:', accessResult);
          setHasValidSubscription(accessResult);
        } catch (error) {
          console.error('Error checking subscription:', error);
          setHasValidSubscription(false);
        } finally {
          console.log('ProtectedRoute: Subscription check complete');
          setCheckingSubscription(false);
        }
      } else if (!user && !loading) {
        console.log('ProtectedRoute: No user and not loading, setting hasValidSubscription=false');
        setHasValidSubscription(false);
        setCheckingSubscription(false);
      }
    };

    verifySubscription();
  }, [user, loading, hasAccess]);

  // Show loading while checking authentication or subscription
  if (loading || checkingSubscription) {
    console.log('ProtectedRoute: Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/auth/login" replace />;
  }

  // Authenticated but no valid subscription - redirect to pricing
  if (!hasValidSubscription) {
    console.log('ProtectedRoute: No valid subscription, redirecting to pricing');
    return <Navigate to="/pricing" replace />;
  }

  // Authenticated with valid subscription - allow access
  console.log('ProtectedRoute: Access granted, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;