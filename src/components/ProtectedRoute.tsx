import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, checkSubscription } = useAuth();
  const [hasValidSubscription, setHasValidSubscription] = useState<boolean | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    const verifySubscription = async () => {
      if (user && !loading) {
        setCheckingSubscription(true);
        try {
          const hasAccess = await checkSubscription();
          setHasValidSubscription(hasAccess);
        } catch (error) {
          console.error('Error checking subscription:', error);
          setHasValidSubscription(false);
        } finally {
          setCheckingSubscription(false);
        }
      } else if (!user && !loading) {
        setHasValidSubscription(false);
        setCheckingSubscription(false);
      }
    };

    verifySubscription();
  }, [user, loading, checkSubscription]);

  // Show loading while checking authentication or subscription
  if (loading || checkingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but no valid subscription - redirect to pricing
  if (!hasValidSubscription) {
    return <Navigate to="/pricing" replace />;
  }

  // Authenticated with valid subscription - allow access
  return <>{children}</>;
};

export default ProtectedRoute;