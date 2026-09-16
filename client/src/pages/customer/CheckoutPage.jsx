import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SEO from '../../components/common/SEO';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { BUSINESS_CONFIG } from '../../config/business';
import api from '../../api/client';
import {
  ShieldCheck,
  Package,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Truck,
  CheckCircle2,
  Lock,
} from 'lucide-react';

const INDIAN_STATES = [
  'Himachal Pradesh',
  'Punjab',
  'Delhi',
  'Haryana',
  'Uttarakhand',
  'Chandigarh',
  'Jammu and Kashmir',
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'Uttar Pradesh',
  'Rajasthan',
  'Gujarat',
  'West Bengal',
  'Kerala',
  'Telangana',
  'Andhra Pradesh',
  'Madhya Pradesh',
  'Bihar',
  'Goa',
  'Assam',
  'Odisha',
  'Jharkhand',
  'Chhattisgarh',
  'Other',
];

export const CheckoutPage = () => {
  const { cartItems, subtotal, shipping, total, clearCart, canCheckout, isVerifying } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    street: '',
    city: '',
    state: 'Himachal Pradesh',
    postalCode: '',
    country: 'India',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Client-side field validations
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your full name (at least 2 characters)';
    }

    const cleanPhone = formData.phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.street.trim() || formData.street.trim().length < 5) {
      newErrors.street = 'Please enter your complete street address (house/flat, area)';
    }

    if (!formData.city.trim() || formData.city.trim().length < 2) {
      newErrors.city = 'Please enter your city';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Please select your state';
    }

    const pinClean = formData.postalCode.trim().replace(/\s/g, '');
    if (!pinClean || !/^\d{6}$/.test(pinClean)) {
      newErrors.postalCode = 'Please enter a valid 6-digit PIN code';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    if (!canCheckout || cartItems.length === 0) {
      setServerError('Your bag contains unavailable or out-of-stock items. Please review your bag.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerInfo: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
        },
        shippingAddress: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.postalCode.trim(),
          country: formData.country.trim() || 'India',
        },
        items: cartItems.map((item) => ({
          productId: item.productId || item.product?._id,
          quantity: item.quantity,
          selectedColor: item.selectedColor || '',
          craftNote: item.craftNote || '',
        })),
        notes: formData.notes.trim(),
      };

      const response = await api.post('/orders', payload);
      const resData = response.data || response;
      const orderData = resData.order || resData;

      if (orderData && orderData.orderNumber) {
        // Clear client shopping bag
        clearCart();

        // Navigate to clean Order Confirmation Page
        navigate(`/order-confirmation/${orderData.orderNumber}`, {
          state: {
            order: orderData,
            whatsappUrl: resData.whatsappUrl,
          },
          replace: true,
        });
      } else {
        throw new Error('Order number not returned by server.');
      }
    } catch (err) {
      console.error('Checkout order submission error:', err);
      setServerError(
        err.message || 'Unable to submit your order request. Please check your details and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // If bag is empty, guide user back to shop
  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 sm:py-24 space-y-6 px-4">
        <SEO title="Secure Checkout | Gurjeet's Handcraft" noindex={true} />
        <div className="w-20 h-20 mx-auto rounded-3xl bg-artisan-cream border border-artisan-heather flex items-center justify-center text-4xl shadow-subtle">
          🧶
        </div>
        <div className="space-y-2">
          <Badge variant="terracotta">Bag is Empty</Badge>
          <h1 className="font-serif text-3xl font-bold text-artisan-earthBrown">
            Nothing to Checkout
          </h1>
          <p className="text-xs sm:text-sm text-artisan-softBrown">
            Please add handcrafted woolen pieces to your bag before proceeding to checkout.
          </p>
        </div>
        <Link to="/shop">
          <Button size="md" className="gap-2">
            <span>Explore The Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-10 space-y-8">
      <SEO title="Secure Checkout | Gurjeet's Handcraft" noindex={true} />
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-artisan-heather pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <Badge variant="terracotta">Artisan Checkout</Badge>
            <span className="text-xs text-artisan-softBrown font-medium">
              &bull; Inquiry & Delivery Request
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown">
            Shipping & Order Details
          </h1>
          <p className="text-xs sm:text-sm text-artisan-softBrown">
            Provide your delivery details. Gurjeet personally confirms every piece before fulfillment.
          </p>
        </div>

        <Link to="/cart">
          <Button variant="secondary" size="sm" className="gap-1.5 hidden sm:inline-flex">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Bag</span>
          </Button>
        </Link>
      </div>

      {serverError && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-subtle"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Main Grid: Form (Left) & Order Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Customer & Delivery Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-5 shadow-subtle">
              <div className="border-b border-artisan-heather/70 pb-3">
                <h2 className="font-serif text-lg font-bold text-artisan-earthBrown">
                  1. Customer Information
                </h2>
                <p className="text-xs text-artisan-softBrown">
                  How Gurjeet will contact you to coordinate craft details
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Full Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-bold text-artisan-earthBrown">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Priya Sharma"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-artisan-ivory text-xs text-artisan-earthBrown transition ${
                      errors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-artisan-heather'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-[11px] text-rose-600">{errors.name}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="block font-bold text-artisan-earthBrown">
                    Phone Number (WhatsApp) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-artisan-softBrown font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="98765 43210"
                      className={`w-full pl-11 pr-3.5 py-2.5 rounded-xl border bg-artisan-ivory text-xs text-artisan-earthBrown transition ${
                        errors.phone ? 'border-rose-400 focus:ring-rose-200' : 'border-artisan-heather'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-rose-600">{errors.phone}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block font-bold text-artisan-earthBrown">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-artisan-ivory text-xs text-artisan-earthBrown transition ${
                      errors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-artisan-heather'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-rose-600">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Address Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-5 shadow-subtle">
              <div className="border-b border-artisan-heather/70 pb-3">
                <h2 className="font-serif text-lg font-bold text-artisan-earthBrown">
                  2. Delivery Address
                </h2>
                <p className="text-xs text-artisan-softBrown">
                  Carefully packaged in Himachal Pradesh and shipped across India
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Street Address */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-bold text-artisan-earthBrown">
                    Street Address (Flat / House No., Landmark) *
                  </label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="e.g. 14 Mountain View Cottage, Mall Road"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-artisan-ivory text-xs text-artisan-earthBrown transition ${
                      errors.street ? 'border-rose-400 focus:ring-rose-200' : 'border-artisan-heather'
                    }`}
                  />
                  {errors.street && (
                    <p className="text-[11px] text-rose-600">{errors.street}</p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="block font-bold text-artisan-earthBrown">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Shimla"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-artisan-ivory text-xs text-artisan-earthBrown transition ${
                      errors.city ? 'border-rose-400 focus:ring-rose-200' : 'border-artisan-heather'
                    }`}
                  />
                  {errors.city && (
                    <p className="text-[11px] text-rose-600">{errors.city}</p>
                  )}
                </div>

                {/* State */}
                <div className="space-y-1">
                  <label className="block font-bold text-artisan-earthBrown">
                    State *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-artisan-ivory text-xs text-artisan-earthBrown transition ${
                      errors.state ? 'border-rose-400 focus:ring-rose-200' : 'border-artisan-heather'
                    }`}
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="text-[11px] text-rose-600">{errors.state}</p>
                  )}
                </div>

                {/* PIN Code */}
                <div className="space-y-1">
                  <label className="block font-bold text-artisan-earthBrown">
                    PIN Code (6 digits) *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    maxLength={6}
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="e.g. 171001"
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-artisan-ivory text-xs text-artisan-earthBrown transition ${
                      errors.postalCode ? 'border-rose-400 focus:ring-rose-200' : 'border-artisan-heather'
                    }`}
                  />
                  {errors.postalCode && (
                    <p className="text-[11px] text-rose-600">{errors.postalCode}</p>
                  )}
                </div>

                {/* Country */}
                <div className="space-y-1">
                  <label className="block font-bold text-artisan-earthBrown">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    disabled
                    value={formData.country}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-artisan-heather bg-artisan-sandstone/30 text-xs text-artisan-softBrown cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Special Instructions / Notes */}
              <div className="space-y-1 pt-2">
                <label className="block font-bold text-artisan-earthBrown text-xs">
                  Special Notes / Sizing Preferences (Optional)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="e.g. Please knit this scarf slightly longer, or special gift wrap requested."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-artisan-heather bg-artisan-ivory text-xs text-artisan-earthBrown"
                />
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                loading={submitting}
                className="w-full justify-center shadow-subtle tap-target"
              >
                <span>Submit Order Request</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <p className="text-[11px] text-center text-artisan-softBrown mt-3">
                By submitting, your order inquiry is saved in Gurjeet's studio queue. No online payment gateway is required.
              </p>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-6 shadow-cozy sticky top-24">
          <div className="border-b border-artisan-heather/70 pb-3">
            <h3 className="font-serif text-lg font-bold text-artisan-earthBrown">
              Order Summary
            </h3>
            <p className="text-xs text-artisan-softBrown">
              {cartItems.length} {cartItems.length === 1 ? 'creation' : 'creations'} in your bag
            </p>
          </div>

          {/* Itemized list with thumbnails */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {cartItems.map((item, idx) => (
              <div
                key={`${item.productId}-${idx}`}
                className="flex items-center gap-3 text-xs"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-artisan-ivory border border-artisan-heather/60 flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-artisan-softBrown/50">
                      <Package className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-bold text-xs text-artisan-earthBrown truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-artisan-softBrown">
                    Qty: <strong className="text-artisan-earthBrown">{item.quantity}</strong>
                    {item.selectedColor && ` &bull; ${item.selectedColor}`}
                  </p>
                </div>

                <span className="font-serif font-bold text-artisan-earthBrown flex-shrink-0">
                  ₹{(item.itemTotal || (item.unitPrice * item.quantity)).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Calculations */}
          <div className="space-y-2 border-t border-artisan-heather/70 pt-4 text-xs">
            <div className="flex justify-between text-artisan-softBrown">
              <span>Subtotal:</span>
              <span className="font-semibold text-artisan-earthBrown">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between text-artisan-softBrown">
              <span>Shipping Fee:</span>
              <span className="font-semibold text-artisan-earthBrown">
                {shipping === 0 ? (
                  <span className="text-emerald-700 font-bold">FREE (Orders ≥ ₹1,499)</span>
                ) : (
                  `₹${shipping}`
                )}
              </span>
            </div>

            <div className="pt-2 border-t border-artisan-heather/60 flex justify-between items-baseline">
              <span className="font-serif text-sm font-bold text-artisan-earthBrown">
                Total Amount:
              </span>
              <span className="font-serif text-xl font-bold text-artisan-terracotta">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Payment Status Notice */}
          <div className="p-3.5 rounded-2xl bg-artisan-ivory border border-artisan-heather text-[11px] text-artisan-softBrown space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-artisan-earthBrown">
              <ShieldCheck className="w-4 h-4 text-artisan-terracotta flex-shrink-0" />
              <span>Payment Pending</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Payment remains pending until Gurjeet personally verifies yarn feasibility, color, and delivery timeline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
