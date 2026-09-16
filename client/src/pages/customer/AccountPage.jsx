import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SEO from '../../components/common/SEO';
import {
  User,
  Package,
  Heart,
  Shield,
  LogOut,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const AccountPage = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-6">
        <SEO title="Account Portal | Gurjeet's Handcraft" noindex={true} />
        <div className="w-16 h-16 mx-auto rounded-full bg-artisan-cream flex items-center justify-center text-artisan-terracotta shadow-subtle">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-artisan-earthBrown">
            Account Portal
          </h1>
          <p className="text-xs sm:text-sm text-artisan-softBrown">
            Please sign in to view your orders, saved pieces, and account preferences.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/login">
            <Button size="md">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button variant="secondary" size="md">
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-10">
      <SEO title="My Account | Gurjeet's Handcraft" noindex={true} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-artisan-heather/70 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant={isAdmin ? 'terracotta' : 'sage'}>
              {isAdmin ? 'Studio Administrator' : 'Valued Customer'}
            </Badge>
            <span className="text-xs text-artisan-softBrown">
              &bull; Gurjeet's Handcraft
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown">
            Welcome, {user.name}!
          </h1>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs font-semibold text-artisan-earthBrown hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition shadow-subtle tap-target self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Account Info Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-6 shadow-subtle">
        <h2 className="font-serif text-xl font-bold text-artisan-earthBrown flex items-center gap-2">
          <User className="w-5 h-5 text-artisan-terracotta" />
          <span>Profile Details</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-artisan-ivory border border-artisan-heather/70 space-y-1">
            <div className="flex items-center gap-1.5 text-artisan-softBrown">
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </div>
            <p className="font-semibold text-artisan-earthBrown">{user.email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-artisan-ivory border border-artisan-heather/70 space-y-1">
            <div className="flex items-center gap-1.5 text-artisan-softBrown">
              <Phone className="w-3.5 h-3.5" />
              <span>Phone</span>
            </div>
            <p className="font-semibold text-artisan-earthBrown">
              {user.phone || 'Not specified'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-artisan-ivory border border-artisan-heather/70 space-y-1">
            <div className="flex items-center gap-1.5 text-artisan-softBrown">
              <Calendar className="w-3.5 h-3.5" />
              <span>Member Since</span>
            </div>
            <p className="font-semibold text-artisan-earthBrown">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
            </p>
          </div>
        </div>
      </div>

      {/* Admin Action Highlight if Admin */}
      {isAdmin && (
        <div className="p-6 sm:p-8 rounded-3xl bg-artisan-sandstone/30 border border-artisan-terracotta/40 space-y-4 shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-artisan-terracotta uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Administrative Access</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-artisan-earthBrown">
                Studio Management Dashboard
              </h3>
              <p className="text-xs sm:text-sm text-artisan-softBrown max-w-xl">
                Manage woolen products, view incoming order requests, and update crafting/dispatch statuses.
              </p>
            </div>

            <Link to="/admin">
              <Button size="md" className="gap-2 shadow-subtle tap-target">
                <span>Enter Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Customer Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Track Orders */}
        <div className="p-6 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-4 shadow-subtle flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-artisan-sandstone flex items-center justify-center text-artisan-earthBrown">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-artisan-earthBrown">
              Order Inquiries & Tracking
            </h3>
            <p className="text-xs text-artisan-softBrown leading-relaxed">
              Check the status of your handcrafted orders from initial yarn selection through needle crafting and postal dispatch.
            </p>
          </div>

          <Link to="/orders">
            <Button variant="secondary" size="sm" className="w-full justify-center">
              Track My Order
            </Button>
          </Link>
        </div>

        {/* Saved Wishlist */}
        <div className="p-6 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-4 shadow-subtle flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-artisan-sandstone flex items-center justify-center text-artisan-terracotta">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-artisan-earthBrown">
              Saved Wishlist
            </h3>
            <p className="text-xs text-artisan-softBrown leading-relaxed">
              Revisit your favorite woolen scarves, beanies, gloves, and mufflers saved for upcoming seasons or gifts.
            </p>
          </div>

          <Link to="/wishlist">
            <Button variant="secondary" size="sm" className="w-full justify-center">
              View Wishlist
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
