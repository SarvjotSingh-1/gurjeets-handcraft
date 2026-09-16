import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MessageCircle,
  Phone,
  Info,
  CheckCircle2,
  AlertCircle,
  Clock,
  Palette,
  Ruler,
  Layers,
  Gift,
  Upload,
  ArrowRight,
  RotateCcw,
  Search,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import DirectContactButton from '../../components/common/DirectContactButton';
import SEO from '../../components/common/SEO';
import { BUSINESS_CONFIG } from '../../config/business';
import api from '../../api/client';

export const CustomOrderPage = () => {
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    productType: 'Scarves',
    colorPreference: '',
    size: '',
    designPattern: '',
    quantity: 1,
    requiredDate: '',
    additionalNotes: '',
    referenceImage: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState('');

  // Status Lookup State (so customers/admin can check status anytime)
  const [trackQuery, setTrackQuery] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');

  // Product Type Options
  const productTypes = [
    { label: 'Woolen Scarves', value: 'Scarves' },
    { label: 'Woolen Gloves', value: 'Gloves' },
    { label: 'Caps & Beanies', value: 'Caps & Beanies' },
    { label: 'Woolen Mufflers', value: 'Mufflers' },
    { label: 'Woolen Socks', value: 'Socks' },
    { label: 'Other Woolen Handcrafts', value: 'Other Woolen Handcrafts' },
  ];

  // Validate form fields
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your name';
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter your phone/WhatsApp number';
    } else if (formData.phone.trim().length < 8) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.colorPreference.trim()) {
      newErrors.colorPreference = 'Please specify your preferred yarn colors';
    }
    if (!formData.size.trim()) {
      newErrors.size = 'Please provide desired size or dimensions';
    }
    if (!formData.designPattern.trim()) {
      newErrors.designPattern = 'Please describe the pattern or stitch preference';
    }
    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/custom-orders', formData);
      if (res?.data) {
        setSubmittedOrder(res.data.customOrder);
        setWhatsAppUrl(res.data.whatsAppContinuationUrl);
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Custom order submission error:', err);
      setServerError(
        err.response?.data?.message ||
          err.message ||
          'Unable to submit custom order request. Please try again or message Gurjeet directly.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Lookup custom order by number
  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;

    setTrackLoading(true);
    setTrackError('');
    setTrackedOrder(null);

    try {
      const res = await api.get(`/custom-orders/${trackQuery.trim().toUpperCase()}`);
      if (res?.data) {
        setTrackedOrder(res.data);
      }
    } catch (err) {
      setTrackError(
        err.response?.data?.message ||
          `Custom order request "${trackQuery}" not found. Please check your request ID.`
      );
    } finally {
      setTrackLoading(false);
    }
  };

  // Reset form
  const handleResetForm = () => {
    setSubmittedOrder(null);
    setWhatsAppUrl('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      productType: 'Scarves',
      colorPreference: '',
      size: '',
      designPattern: '',
      quantity: 1,
      requiredDate: '',
      additionalNotes: '',
      referenceImage: '',
    });
    setErrors({});
  };

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline">Pending Review</Badge>;
      case 'Under Review':
        return <Badge variant="craft">Under Review</Badge>;
      case 'Accepted':
        return <Badge variant="sage">Accepted</Badge>;
      case 'Rejected':
        return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">Declined</span>;
      case 'Completed':
        return <Badge variant="sage">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16">
      <SEO
        title="Custom Handmade Woolen Orders & Commissions | Gurjeet's Handcraft"
        description="Request bespoke handmade woolen scarves, beanies, caps, gloves, and blankets customized to your exact dimensions, preferred wool colors, and stitch patterns."
        keywords={[
          'custom woolen orders',
          'bespoke handmade scarf',
          'custom knit beanie',
          'personalized woolen gifts',
          'made to order knitwear',
          'commission knitwear Gurjeet',
        ]}
        canonical="/custom-orders"
      />

      {/* =========================================================================
          PAGE HEADER
          ========================================================================= */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2">
          <Badge variant="terracotta">Bespoke Artisan Commissions</Badge>
          <span className="text-xs text-artisan-softBrown font-medium">
            &bull; Handmade by Gurjeet
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-artisan-earthBrown tracking-tight">
          Custom Woolen Orders
        </h1>

        <p className="text-sm sm:text-base text-artisan-softBrown max-w-2xl mx-auto leading-relaxed">
          Looking for a specific wool shade, a tailored scarf length, or a custom-knitted gift for a loved one? Gurjeet welcomes custom requests crafted with pure yarn, wooden needles, and crochet hooks.
        </p>
      </div>

      {/* =========================================================================
          "PREFER TO DISCUSS DIRECTLY?" CALLOUT BAR
          ========================================================================= */}
      <div className="rounded-3xl bg-artisan-ivory border border-artisan-heather p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-subtle">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-artisan-terracotta uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Maker Consultation</span>
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-artisan-earthBrown">
            Prefer to discuss directly with Gurjeet?
          </h3>
          <p className="text-xs text-artisan-softBrown">
            Share pattern ideas, color swatches, or questions directly:
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <DirectContactButton
            action="contact_gurjeet"
            label="Contact Gurjeet"
            variant="whatsapp"
            size="md"
          />

          <DirectContactButton
            action="ask_availability"
            label="Ask About Availability"
            variant="secondary"
            size="md"
          />

          <a
            href={`tel:${BUSINESS_CONFIG.phone}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-artisan-cream border border-artisan-heather text-xs font-bold text-artisan-earthBrown hover:bg-artisan-sandstone transition tap-target"
          >
            <Phone className="w-4 h-4 text-artisan-softBrown" />
            <span>Call: {BUSINESS_CONFIG.displayPhone}</span>
          </a>
        </div>
      </div>

      {/* =========================================================================
          ARTISAN CONFIRMATION NOTICE & FEASIBILITY DISCLAIMER
          ========================================================================= */}
      <div className="p-5 rounded-2xl bg-artisan-cream border border-artisan-heather flex items-start gap-3.5 text-xs text-artisan-earthBrown">
        <Info className="w-5 h-5 text-artisan-terracotta flex-shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <strong className="block text-artisan-earthBrown font-serif text-sm">
            How Custom Woolen Orders Work:
          </strong>
          <p className="text-artisan-softBrown">
            Submitting this request does not automatically charge you. Every request is reviewed manually by Gurjeet. We do not automatically guarantee delivery dates, availability, or feasibility until Gurjeet personally confirms yarn stock, pricing, and crafting timelines with you.
          </p>
        </div>
      </div>

      {/* =========================================================================
          SUCCESS VIEW (SHOWN AFTER SUBMISSION)
          ========================================================================= */}
      {submittedOrder ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-artisan-cream border border-artisan-heather p-8 sm:p-12 space-y-8 shadow-card"
        >
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 block">
              Custom Request Submitted Successfully
            </span>

            <h2 className="font-serif text-3xl font-bold text-artisan-earthBrown">
              Thank You, {submittedOrder.name}!
            </h2>

            <p className="text-xs sm:text-sm text-artisan-softBrown max-w-xl mx-auto leading-relaxed">
              Your custom request ID is{' '}
              <strong className="font-mono text-artisan-earthBrown px-2 py-0.5 bg-artisan-ivory rounded border border-artisan-heather">
                {submittedOrder.customOrderNumber}
              </strong>
              . Gurjeet will review your request and personally confirm feasibility, price and timeline on WhatsApp or phone.
            </p>
          </div>

          {/* Submitted Summary Details */}
          <div className="p-6 rounded-2xl bg-artisan-ivory border border-artisan-heather space-y-3 text-xs">
            <div className="flex justify-between border-b border-artisan-heather/70 pb-2">
              <span className="text-artisan-softBrown">Status:</span>
              <span>{getStatusBadge(submittedOrder.status)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-artisan-softBrown">Product Type:</span>
              <span className="font-semibold text-artisan-earthBrown">{submittedOrder.productType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-artisan-softBrown">Color Preference:</span>
              <span className="font-semibold text-artisan-earthBrown">{submittedOrder.colorPreference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-artisan-softBrown">Size / Dimensions:</span>
              <span className="font-semibold text-artisan-earthBrown">{submittedOrder.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-artisan-softBrown">Design / Pattern:</span>
              <span className="font-semibold text-artisan-earthBrown">{submittedOrder.designPattern}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-artisan-softBrown">Quantity:</span>
              <span className="font-semibold text-artisan-earthBrown">{submittedOrder.quantity}</span>
            </div>
            {submittedOrder.requiredDate && (
              <div className="flex justify-between">
                <span className="text-artisan-softBrown">Target Date:</span>
                <span className="font-semibold text-artisan-earthBrown">{submittedOrder.requiredDate}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full py-4 px-6 rounded-2xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#20ba59] transition shadow-card tap-target"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Continue Discussion on WhatsApp</span>
            </a>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={handleResetForm}
                className="flex-1 py-3 px-4 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs font-semibold text-artisan-earthBrown hover:bg-white transition tap-target"
              >
                Submit Another Custom Request
              </button>

              <a
                href={`tel:${BUSINESS_CONFIG.phone}`}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs font-semibold text-artisan-earthBrown hover:bg-white transition tap-target"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Gurjeet ({BUSINESS_CONFIG.displayPhone})</span>
              </a>
            </div>
          </div>
        </motion.div>
      ) : (
        /* =========================================================================
            CUSTOM ORDER FORM
            ========================================================================= */
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-3xl bg-artisan-cream border border-artisan-heather p-6 sm:p-10 space-y-8 shadow-card"
        >
          {serverError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Section 1: Contact Details */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-artisan-earthBrown border-b border-artisan-heather/70 pb-2">
              1. Your Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-artisan-earthBrown">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ananya Sharma"
                  className={`w-full px-4 py-2.5 rounded-2xl bg-artisan-ivory border text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta transition ${
                    errors.name ? 'border-rose-400 bg-rose-50/40' : 'border-artisan-heather'
                  }`}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-[11px] text-rose-600">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-artisan-earthBrown">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ananya@example.com"
                  className={`w-full px-4 py-2.5 rounded-2xl bg-artisan-ivory border text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta transition ${
                    errors.email ? 'border-rose-400 bg-rose-50/40' : 'border-artisan-heather'
                  }`}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-[11px] text-rose-600">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-artisan-earthBrown">
                  Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className={`w-full px-4 py-2.5 rounded-2xl bg-artisan-ivory border text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta transition ${
                    errors.phone ? 'border-rose-400 bg-rose-50/40' : 'border-artisan-heather'
                  }`}
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && <p className="text-[11px] text-rose-600">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Product & Specifications */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-artisan-earthBrown border-b border-artisan-heather/70 pb-2">
              2. Custom Woolen Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-artisan-earthBrown">
                  Product Type *
                </label>
                <select
                  value={formData.productType}
                  onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta"
                >
                  {productTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-artisan-earthBrown">
                  Quantity *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: Math.max(1, parseInt(e.target.value, 10) || 1),
                      })
                    }
                    className="w-28 px-4 py-2.5 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta"
                  />
                  <span className="text-xs text-artisan-softBrown italic">
                    Handcrafted in small batches
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Color Preference */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-artisan-earthBrown">
                  Color Preference *
                </label>
                <input
                  type="text"
                  value={formData.colorPreference}
                  onChange={(e) => setFormData({ ...formData, colorPreference: e.target.value })}
                  placeholder="e.g. Oatmeal beige, Soft sage green, Terracotta"
                  className={`w-full px-4 py-2.5 rounded-2xl bg-artisan-ivory border text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta transition ${
                    errors.colorPreference ? 'border-rose-400 bg-rose-50/40' : 'border-artisan-heather'
                  }`}
                  aria-invalid={!!errors.colorPreference}
                />
                {errors.colorPreference && (
                  <p className="text-[11px] text-rose-600">{errors.colorPreference}</p>
                )}
              </div>

              {/* Size / Dimensions */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-artisan-earthBrown">
                  Desired Size / Dimensions *
                </label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="e.g. Length 190cm x 25cm width, or Head 56cm"
                  className={`w-full px-4 py-2.5 rounded-2xl bg-artisan-ivory border text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta transition ${
                    errors.size ? 'border-rose-400 bg-rose-50/40' : 'border-artisan-heather'
                  }`}
                  aria-invalid={!!errors.size}
                />
                {errors.size && <p className="text-[11px] text-rose-600">{errors.size}</p>}
              </div>
            </div>

            {/* Design / Pattern */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-artisan-earthBrown">
                Design / Pattern Preference *
              </label>
              <input
                type="text"
                value={formData.designPattern}
                onChange={(e) => setFormData({ ...formData, designPattern: e.target.value })}
                placeholder="e.g. Thick fisherman ribbing, Honeycomb cables, or Minimalist garter stitch"
                className={`w-full px-4 py-2.5 rounded-2xl bg-artisan-ivory border text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta transition ${
                  errors.designPattern ? 'border-rose-400 bg-rose-50/40' : 'border-artisan-heather'
                }`}
                aria-invalid={!!errors.designPattern}
              />
              {errors.designPattern && (
                <p className="text-[11px] text-rose-600">{errors.designPattern}</p>
              )}
            </div>

            {/* Target Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-artisan-earthBrown">
                Target Date (Optional)
              </label>
              <input
                type="text"
                value={formData.requiredDate}
                onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                placeholder="e.g. Needed for trip by Dec 15th, or Birthday gift"
                className="w-full px-4 py-2.5 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta"
              />
              <p className="text-[11px] text-artisan-softBrown">
                Note: Delivery dates are not automatically guaranteed. Gurjeet will confirm crafting schedule with you.
              </p>
            </div>
          </div>

          {/* Section 3: Additional Notes & Reference */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-artisan-earthBrown border-b border-artisan-heather/70 pb-2">
              3. Additional Notes & References
            </h3>

            {/* Additional Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-artisan-earthBrown">
                Special Requests or Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                placeholder="Tell Gurjeet about sensitive skin preferences, gift box wrapping, or special pattern details..."
                className="w-full px-4 py-2.5 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta"
              />
            </div>

            {/* Reference Image Description or URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-artisan-earthBrown">
                Reference Image (Optional Link or Note)
              </label>
              <input
                type="text"
                value={formData.referenceImage}
                onChange={(e) => setFormData({ ...formData, referenceImage: e.target.value })}
                placeholder="Paste an image link or note: 'Will share photo via WhatsApp'"
                className="w-full px-4 py-2.5 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta"
              />
              <span className="text-[11px] text-artisan-softBrown">
                You can also attach pattern reference photos directly in your WhatsApp follow-up conversation.
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              loading={submitting}
              className="w-full justify-center text-sm sm:text-base py-4 shadow-card"
            >
              <span>Submit Custom Order Request</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </form>
      )}

      {/* =========================================================================
          CUSTOM ORDER STATUS TRACKER & ADMIN LOOKUP
          ========================================================================= */}
      <section className="rounded-3xl bg-artisan-ivory border border-artisan-heather p-6 sm:p-8 space-y-6 shadow-subtle">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-artisan-terracotta uppercase tracking-wider">
            <Search className="w-3.5 h-3.5" />
            <span>Check Custom Request Status</span>
          </div>
          <h3 className="font-serif text-xl font-bold text-artisan-earthBrown">
            Track a Submitted Custom Order
          </h3>
          <p className="text-xs text-artisan-softBrown">
            Enter your Custom Request ID (e.g. <code>GH-CUST-136160</code>) to see the latest review status:
          </p>
        </div>

        <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={trackQuery}
            onChange={(e) => setTrackQuery(e.target.value)}
            placeholder="Enter Custom Request ID (e.g. GH-CUST-...)"
            className="flex-1 px-4 py-2.5 rounded-2xl bg-artisan-cream border border-artisan-heather text-xs sm:text-sm text-artisan-earthBrown uppercase focus:outline-none focus:border-artisan-terracotta"
          />
          <Button type="submit" size="md" loading={trackLoading} className="sm:w-auto">
            Check Status
          </Button>
        </form>

        {trackError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {trackError}
          </div>
        )}

        {trackedOrder && (
          <div className="p-6 rounded-2xl bg-artisan-cream border border-artisan-heather space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-artisan-heather pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-artisan-softBrown">
                  {trackedOrder.customOrderNumber}
                </span>
                <h4 className="font-serif text-lg font-bold text-artisan-earthBrown">
                  {trackedOrder.productType} &bull; {trackedOrder.name}
                </h4>
              </div>
              <div>{getStatusBadge(trackedOrder.status)}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-artisan-softBrown">
              <div>
                <strong>Color:</strong> {trackedOrder.colorPreference}
              </div>
              <div>
                <strong>Size:</strong> {trackedOrder.size}
              </div>
              <div>
                <strong>Pattern:</strong> {trackedOrder.designPattern}
              </div>
              <div>
                <strong>Quantity:</strong> {trackedOrder.quantity}
              </div>
            </div>

            {trackedOrder.adminNotes && (
              <div className="p-3 rounded-xl bg-artisan-ivory border border-artisan-heather text-xs text-artisan-earthBrown space-y-0.5">
                <span className="font-semibold text-artisan-terracotta">Note from Gurjeet:</span>
                <p>{trackedOrder.adminNotes}</p>
              </div>
            )}

            <div className="pt-2 border-t border-artisan-heather flex flex-wrap gap-3">
              <a
                href={BUSINESS_CONFIG.createWhatsAppUrl(
                  `Hello Gurjeet, I am inquiring about my Custom Order Request: *${trackedOrder.customOrderNumber}* (Current status: ${trackedOrder.status}).`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-artisan-earthBrown bg-[#25D366]/10 border border-[#25D366]/40 px-4 py-2 rounded-xl hover:bg-[#25D366]/20 transition"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Message Gurjeet on WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* Status Lifecycle Guide */}
        <div className="pt-2 border-t border-artisan-heather/80 space-y-2 text-xs text-artisan-softBrown">
          <span className="font-semibold text-artisan-earthBrown block">
            Custom Order Status Stages:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
            <div className="p-2 rounded-xl bg-artisan-cream border border-artisan-heather">
              <span className="font-bold block text-artisan-earthBrown">Pending</span>
              <span className="text-[10px]">Received</span>
            </div>
            <div className="p-2 rounded-xl bg-artisan-cream border border-artisan-heather">
              <span className="font-bold block text-artisan-earthBrown">Under Review</span>
              <span className="text-[10px]">Checking Yarn</span>
            </div>
            <div className="p-2 rounded-xl bg-artisan-cream border border-artisan-heather">
              <span className="font-bold block text-artisan-earthBrown">Accepted</span>
              <span className="text-[10px]">Crafting Slated</span>
            </div>
            <div className="p-2 rounded-xl bg-artisan-cream border border-artisan-heather">
              <span className="font-bold block text-artisan-earthBrown">Rejected</span>
              <span className="text-[10px]">Feasibility Issue</span>
            </div>
            <div className="p-2 rounded-xl bg-artisan-cream border border-artisan-heather">
              <span className="font-bold block text-artisan-earthBrown">Completed</span>
              <span className="text-[10px]">Ready / Dispatched</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomOrderPage;
