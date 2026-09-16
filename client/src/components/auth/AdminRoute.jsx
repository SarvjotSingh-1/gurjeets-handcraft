import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '../common/Button';

export const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-artisan-terracotta/30 border-t-artisan-terracotta rounded-full animate-spin" />
        <p className="text-xs text-artisan-softBrown">Verifying studio administrative permissions...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-artisan-cream border border-rose-300 text-center space-y-5 shadow-card">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-artisan-earthBrown">
            Access Restricted
          </h2>
          <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
            This area is restricted to studio administrative personnel. Your current account (<strong>{user.email}</strong>) does not have admin privileges.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/account">
            <Button size="md" variant="secondary" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to My Account
            </Button>
          </Link>
          <Link to="/">
            <Button size="md" className="w-full">
              Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
