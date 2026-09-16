import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-artisan-terracotta/30 border-t-artisan-terracotta rounded-full animate-spin" />
        <p className="text-xs text-artisan-softBrown">Checking artisan session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
