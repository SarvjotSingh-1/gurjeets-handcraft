import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SEO from '../../components/common/SEO';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    isAdmin: false,
    adminSecret: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.isAdmin && !formData.adminSecret.trim()) {
      setError('Please provide the studio admin secret key');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.isAdmin ? 'admin' : 'customer',
        ...(formData.isAdmin && { adminSecret: formData.adminSecret.trim() }),
      };

      const data = await register(payload);
      if (data.user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/account', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-8">
      <SEO title="Create an Account | Gurjeet's Handcraft" noindex={true} />
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge variant="terracotta">Join Gurjeet's Community</Badge>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown tracking-tight">
          Create an Account
        </h1>
        <p className="text-xs sm:text-sm text-artisan-softBrown max-w-sm mx-auto">
          Save favorite pieces, track order requests, and receive personal updates from Gurjeet.
        </p>
      </div>

      {/* Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-6 shadow-card">
        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="register-name"
              className="block text-xs font-bold text-artisan-earthBrown"
            >
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-artisan-softBrown absolute left-4 top-3.5" />
              <input
                id="register-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Priya Sharma"
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:ring-2 focus:ring-artisan-terracotta/40 transition tap-target"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="register-email"
              className="block text-xs font-bold text-artisan-earthBrown"
            >
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-artisan-softBrown absolute left-4 top-3.5" />
              <input
                id="register-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="priya@example.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:ring-2 focus:ring-artisan-terracotta/40 transition tap-target"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label
              htmlFor="register-phone"
              className="block text-xs font-bold text-artisan-earthBrown"
            >
              Phone / WhatsApp Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-artisan-softBrown absolute left-4 top-3.5" />
              <input
                id="register-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="7018183172"
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:ring-2 focus:ring-artisan-terracotta/40 transition tap-target"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="register-password"
              className="block text-xs font-bold text-artisan-earthBrown"
            >
              Password (min. 6 characters) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-artisan-softBrown absolute left-4 top-3.5" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-2.5 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:ring-2 focus:ring-artisan-terracotta/40 transition tap-target"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-artisan-softBrown hover:text-artisan-earthBrown tap-target"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="register-confirm-password"
              className="block text-xs font-bold text-artisan-earthBrown"
            >
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-artisan-softBrown absolute left-4 top-3.5" />
              <input
                id="register-confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:ring-2 focus:ring-artisan-terracotta/40 transition tap-target"
              />
            </div>
          </div>

          {/* Admin Role Disclosure Toggle */}
          <div className="pt-2 border-t border-artisan-heather/70 space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-artisan-earthBrown cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAdmin}
                onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                className="rounded border-artisan-heather text-artisan-terracotta focus:ring-artisan-terracotta"
              />
              <Shield className="w-3.5 h-3.5 text-artisan-terracotta" />
              <span>Register as Studio Administrator</span>
            </label>

            {formData.isAdmin && (
              <div className="p-3 rounded-2xl bg-artisan-ivory border border-artisan-heather space-y-1 text-xs">
                <label
                  htmlFor="admin-secret"
                  className="block text-[11px] font-bold text-artisan-earthBrown"
                >
                  Admin Secret Key *
                </label>
                <input
                  id="admin-secret"
                  type="password"
                  value={formData.adminSecret}
                  onChange={(e) => setFormData({ ...formData, adminSecret: e.target.value })}
                  placeholder="Enter admin passcode"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-artisan-heather text-xs text-artisan-earthBrown focus:outline-none focus:ring-2 focus:ring-artisan-terracotta"
                />
                <p className="text-[10px] text-artisan-softBrown">
                  Authorized studio key provided by Gurjeet.
                </p>
              </div>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            loading={submitting}
            className="w-full justify-center shadow-subtle tap-target mt-2"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            <span>Create Account</span>
          </Button>
        </form>

        {/* Footer Link to Login */}
        <div className="pt-2 text-center text-xs text-artisan-softBrown">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-artisan-terracotta hover:underline inline-flex items-center gap-1"
          >
            <span>Sign in here</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
