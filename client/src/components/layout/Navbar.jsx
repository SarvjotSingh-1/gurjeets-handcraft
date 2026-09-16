import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  MessageCircle,
  Phone,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { BUSINESS_CONFIG } from '../../config/business';
import CartDrawer from '../cart/CartDrawer';
import SearchModal from '../common/SearchModal';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation Links as explicitly requested
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Our Story', path: '/our-story' },
    { name: "How It's Made", path: '/how-its-made' },
    { name: 'Custom Orders', path: '/custom-orders' },
    { name: 'Contact', path: '/contact' },
  ];

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Smooth scroll shrink detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 24) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Keyboard shortcut: Ctrl+K or Cmd+K to open search, Escape to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        role="banner"
        className={`sticky top-0 z-40 w-full transition-all duration-300 ease-artisan ${
          isScrolled
            ? 'bg-artisan-ivory/95 backdrop-blur-md shadow-subtle border-b border-artisan-heather/80 py-2.5 sm:py-3'
            : 'bg-artisan-ivory/90 backdrop-blur-sm border-b border-artisan-heather/60 py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left: Mobile Menu Toggle Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2.5 rounded-2xl text-artisan-earthBrown hover:bg-artisan-cream border border-transparent hover:border-artisan-heather transition tap-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-artisan-terracotta/60"
                aria-label="Open Navigation Menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Brand Logo / Header */}
            <div className="flex-1 lg:flex-none text-center lg:text-left">
              <Link
                to="/"
                className="inline-flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-artisan-terracotta/60 rounded-xl"
                aria-label="Gurjeet's Handcraft - Back to Homepage"
              >
                <div className="relative">
                  <img
                    src="/assets/yarn-icon.svg"
                    alt="Gurjeet's Handcraft Hand-Spun Wool Brandmark"
                    className={`transition-all duration-500 ease-artisan group-hover:rotate-12 ${
                      isScrolled ? 'w-8 h-8 sm:w-9 sm:h-9' : 'w-9 h-9 sm:w-10 sm:h-10'
                    }`}
                  />
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-artisan-terracotta/80 group-hover:scale-125 transition-transform" />
                </div>

                <div className="flex flex-col text-left">
                  <span
                    className={`font-serif font-bold tracking-tight text-artisan-earthBrown transition-all duration-300 ${
                      isScrolled ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
                    }`}
                  >
                    Gurjeet's Handcraft
                  </span>
                  <span className="text-[10px] tracking-widest uppercase font-sans text-artisan-softBrown font-medium">
                    Handmade Woolen Studio
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav
              className="hidden lg:flex items-center space-x-7 xl:space-x-8"
              aria-label="Main Navigation"
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `relative text-xs uppercase tracking-artisan font-medium transition-colors duration-200 py-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-artisan-terracotta/60 rounded-md ${
                      isActive
                        ? 'text-artisan-terracotta font-semibold'
                        : 'text-artisan-earthBrown/85 hover:text-artisan-terracotta'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span>{link.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-artisan-terracotta rounded-full"
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Right Side Utility Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Search Button */}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="p-2.5 rounded-full text-artisan-earthBrown/85 hover:text-artisan-terracotta hover:bg-artisan-cream transition tap-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-artisan-terracotta/60"
                title="Search woolen creations (Ctrl+K)"
                aria-label="Search creations"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Link with Counter */}
              <Link
                to="/wishlist"
                className="relative p-2.5 rounded-full text-artisan-earthBrown/85 hover:text-artisan-terracotta hover:bg-artisan-cream transition tap-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-artisan-terracotta/60"
                title="Saved creations wishlist"
                aria-label={`Wishlist, ${totalWishlistItems} saved items`}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    totalWishlistItems > 0
                      ? 'fill-artisan-terracotta/20 text-artisan-terracotta'
                      : 'text-artisan-earthBrown/85'
                  }`}
                />
                {totalWishlistItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 bg-artisan-terracotta text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-subtle pointer-events-none"
                  >
                    {totalWishlistItems > 9 ? '9+' : totalWishlistItems}
                  </motion.span>
                )}
              </Link>

              {/* Cart Drawer Trigger Button with Counter */}
              <button
                type="button"
                onClick={() => setCartDrawerOpen(true)}
                className="relative p-2.5 rounded-full text-artisan-earthBrown/85 hover:text-artisan-terracotta hover:bg-artisan-cream transition tap-target cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-artisan-terracotta/60"
                title="Open Shopping Bag"
                aria-label={`Shopping bag, ${totalItems} items`}
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 bg-artisan-terracotta text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-subtle pointer-events-none"
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </motion.span>
                )}
              </button>

              {/* Account Link or Profile Dropdown */}
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  className="p-2.5 rounded-full text-artisan-earthBrown/85 hover:text-artisan-terracotta hover:bg-artisan-cream transition tap-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-artisan-terracotta/60"
                  title="Sign In / Register"
                  aria-label="Sign in to your account"
                >
                  <User className="w-5 h-5" />
                </Link>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 py-1 px-2.5 sm:px-3 rounded-full bg-artisan-cream/80 hover:bg-artisan-cream border border-artisan-heather text-artisan-earthBrown transition tap-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-artisan-terracotta/60"
                    title={`Logged in as ${user?.name || 'User'}`}
                    aria-expanded={userDropdownOpen}
                  >
                    <div className="w-6 h-6 rounded-full bg-artisan-terracotta/15 text-artisan-terracotta flex items-center justify-center font-bold text-xs">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-medium max-w-[80px] sm:max-w-[100px] truncate hidden md:inline-block">
                      {user?.name?.split(' ')[0] || 'Account'}
                    </span>
                    {isAdmin && (
                      <span className="hidden xl:inline-flex items-center gap-0.5 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-artisan-terracotta/10 text-artisan-terracotta border border-artisan-terracotta/20">
                        Admin
                      </span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 text-artisan-softBrown transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl bg-artisan-ivory border border-artisan-heather shadow-modal p-2 z-50"
                      >
                        <div className="px-3 py-2 border-b border-artisan-heather/60 mb-1">
                          <p className="text-xs font-bold text-artisan-earthBrown truncate">{user?.name}</p>
                          <p className="text-[11px] text-artisan-softBrown truncate">{user?.email}</p>
                          {isAdmin && (
                            <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-artisan-terracotta">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Studio Administrator</span>
                            </div>
                          )}
                        </div>

                        <Link
                          to="/account"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-artisan-earthBrown hover:bg-artisan-sandstone/50 transition"
                        >
                          <User className="w-4 h-4 text-artisan-softBrown" />
                          <span>My Account & Orders</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-artisan-terracotta hover:bg-artisan-terracotta/10 transition"
                          >
                            <ShieldCheck className="w-4 h-4 text-artisan-terracotta" />
                            <span>Admin Studio Dashboard</span>
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                            navigate('/login');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition text-left"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>Log Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Elegant Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div
            id="mobile-navigation-drawer"
            className="fixed inset-0 z-50 lg:hidden flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-artisan-earthBrown/50 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Slide-out Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative w-full max-w-sm sm:max-w-md bg-artisan-cream border-l border-artisan-heather shadow-modal z-10 flex flex-col justify-between h-full overflow-y-auto"
            >
              {/* Drawer Top Bar */}
              <div className="p-5 border-b border-artisan-heather/80 flex items-center justify-between">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center gap-2.5"
                >
                  <img
                    src="/assets/yarn-icon.svg"
                    alt="Gurjeet's Handcraft Logo"
                    className="w-8 h-8"
                  />
                  <div>
                    <span className="font-serif font-bold text-base text-artisan-earthBrown block leading-tight">
                      Gurjeet's Handcraft
                    </span>
                    <span className="text-[10px] tracking-wider uppercase text-artisan-softBrown block">
                      Handmade by Gurjeet
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-full text-artisan-earthBrown hover:bg-artisan-sandstone transition tap-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-artisan-terracotta"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Search Trigger */}
              <div className="px-5 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-artisan-ivory border border-artisan-heather text-artisan-softBrown hover:text-artisan-earthBrown hover:border-artisan-softBrown/50 transition tap-target"
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <Search className="w-4 h-4 text-artisan-softBrown" />
                    <span>Search scarves, beanies, gloves...</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-artisan-sandstone text-artisan-earthBrown">
                    Search
                  </span>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="p-5 space-y-1 flex-1" aria-label="Mobile Main Links">
                <p className="text-[11px] uppercase tracking-widest text-artisan-softBrown font-semibold px-3 mb-2">
                  Navigation
                </p>

                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between py-3 px-4 rounded-2xl text-sm font-medium transition tap-target ${
                        isActive
                          ? 'bg-artisan-sandstone/80 text-artisan-terracotta font-bold shadow-xs'
                          : 'text-artisan-earthBrown hover:bg-artisan-sandstone/40'
                      }`
                    }
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="w-4 h-4 opacity-50" />
                  </NavLink>
                ))}

                {/* Quick Utility Section in Drawer */}
                <div className="pt-4 mt-2 border-t border-artisan-heather/70 space-y-1">
                  <p className="text-[11px] uppercase tracking-widest text-artisan-softBrown font-semibold px-3 mb-2">
                    My Studio Bag & Saved
                  </p>

                  {/* Wishlist Link */}
                  <Link
                    to="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3 px-4 rounded-2xl text-sm font-medium text-artisan-earthBrown hover:bg-artisan-sandstone/40 transition tap-target"
                  >
                    <div className="flex items-center gap-2.5">
                      <Heart className="w-4 h-4 text-artisan-terracotta" />
                      <span>Saved Wishlist</span>
                    </div>
                    {totalWishlistItems > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-artisan-terracotta text-white">
                        {totalWishlistItems}
                      </span>
                    )}
                  </Link>

                  {/* Cart Drawer Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCartDrawerOpen(true);
                    }}
                    className="w-full flex items-center justify-between py-3 px-4 rounded-2xl text-sm font-medium text-artisan-earthBrown hover:bg-artisan-sandstone/40 transition tap-target"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="w-4 h-4 text-artisan-terracotta" />
                      <span>Shopping Bag</span>
                    </div>
                    {totalItems > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-artisan-terracotta text-white">
                        {totalItems}
                      </span>
                    )}
                  </button>

                  {/* Account Section */}
                  {isAuthenticated ? (
                    <div className="p-3.5 rounded-2xl bg-artisan-ivory border border-artisan-heather/80 space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-artisan-terracotta/15 text-artisan-terracotta font-bold text-xs flex items-center justify-center shrink-0">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-xs text-artisan-earthBrown block truncate">
                              {user?.name}
                            </span>
                            <span className="text-[10px] text-artisan-softBrown block truncate">
                              {user?.email}
                            </span>
                          </div>
                        </div>
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-artisan-terracotta/15 text-artisan-terracotta border border-artisan-terracotta/25 shrink-0">
                            <ShieldCheck className="w-3 h-3" /> Admin
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-medium text-artisan-softBrown shrink-0">
                            Customer
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-artisan-heather/50 space-y-1">
                        <Link
                          to="/account"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between py-2 px-2.5 rounded-xl text-xs font-medium text-artisan-earthBrown hover:bg-artisan-sandstone/50 transition"
                        >
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-artisan-softBrown" />
                            <span>My Account & Orders</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between py-2 px-2.5 rounded-xl text-xs font-bold text-artisan-terracotta hover:bg-artisan-terracotta/10 transition"
                          >
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-3.5 h-3.5 text-artisan-terracotta" />
                              <span>Admin Studio Dashboard</span>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-artisan-terracotta" />
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            logout();
                            navigate('/login');
                          }}
                          className="w-full flex items-center justify-between py-2 px-2.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition"
                        >
                          <div className="flex items-center gap-2">
                            <LogOut className="w-3.5 h-3.5 text-red-500" />
                            <span>Log Out</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between py-3 px-4 rounded-2xl text-sm font-medium text-artisan-earthBrown hover:bg-artisan-sandstone/40 transition tap-target"
                    >
                      <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-artisan-softBrown" />
                        <span>Log In / Sign Up</span>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-50" />
                    </Link>
                  )}
                </div>
              </nav>

              {/* Drawer Bottom Personal Contact Section */}
              <div className="p-5 border-t border-artisan-heather/80 bg-artisan-ivory/60 space-y-3">
                <div className="flex items-center gap-2 text-xs text-artisan-softBrown font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-artisan-terracotta" />
                  <span>Personal craft inquiries welcome:</span>
                </div>

                <a
                  href={BUSINESS_CONFIG.whatsappBaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between w-full py-3 px-4 rounded-2xl text-xs font-semibold text-artisan-earthBrown bg-[#25D366]/10 border border-[#25D366]/40 hover:bg-[#25D366]/20 transition tap-target"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>WhatsApp Inquiry</span>
                  </div>
                  <span className="font-mono text-artisan-earthBrown/90">
                    {BUSINESS_CONFIG.displayPhone}
                  </span>
                </a>

                <a
                  href={`tel:${BUSINESS_CONFIG.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-2xl text-xs font-semibold text-artisan-softBrown hover:text-artisan-earthBrown hover:bg-artisan-sandstone/40 transition tap-target"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Studio: {BUSINESS_CONFIG.displayPhone}</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reusable Live Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />
    </>
  );
};

export default Navbar;
