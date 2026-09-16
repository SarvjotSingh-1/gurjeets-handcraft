import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SEO from '../../components/common/SEO';

export const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/account');
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setSubmitting(true);

    try {
      const data = await login(formData.email.trim(), formData.password);
      const destination = location.state?.from?.pathname || (data.user?.role === 'admin' ? '/admin' : '/account');
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-8">
      <SEO title="Sign In | Gurjeet's Handcraft" noindex={true} />
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge variant="terracotta">Artisan Atelier</Badge>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown tracking-tight">
          Welcome Back
        </h1>
        <p className="text-xs sm:text-sm text-artisan-softBrown max-w-sm mx-auto">
          Sign in to view your orders, saved pieces, or manage studio craft operations.
        </p>
      </div>

      {/* Login Card */}
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
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="block text-xs font-bold text-artisan-earthBrown"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-artisan-softBrown absolute left-4 top-3.5" />
              <input
                id="login-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="priya@example.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:ring-2 focus:ring-artisan-terracotta/40 transition tap-target"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="block text-xs font-bold text-artisan-earthBrown"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-artisan-softBrown absolute left-4 top-3.5" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
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

          <Button
            type="submit"
            size="lg"
            loading={submitting}
            className="w-full justify-center shadow-subtle tap-target mt-2"
          >
            <LogIn className="w-4 h-4 mr-2" />
            <span>Sign In</span>
          </Button>
        </form>

        {/* Footer Link to Register */}
        <div className="pt-4 border-t border-artisan-heather/70 text-center text-xs text-artisan-softBrown">
          Don't have an account yet?{' '}
          <Link
            to="/register"
            className="font-bold text-artisan-terracotta hover:underline inline-flex items-center gap-1"
          >
            <span>Create one now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
