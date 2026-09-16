import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Phone,
  Send,
  Mail,
  MapPin,
  Clock,
  Share2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  HelpCircle,
  ArrowDown,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SEO from '../../components/common/SEO';
import { BUSINESS_CONFIG } from '../../config/business';
import api from '../../api/client';

export const ContactPage = () => {
  const contactFormRef = useRef(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Product Inquiry',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  // Subject options
  const subjects = [
    'Product Inquiry',
    'Custom Color Request',
    'Sizing & Wool Care',
    'Order Status Inquiry',
    'General Question',
  ];

  // Useful FAQ list with realistic, honest answers (strictly NO unsupported promises)
  const faqs = [
    {
      q: 'Are products handmade?',
      a: "Yes, 100%. Every single piece is personally handmade by Gurjeet using wooden knitting needles and crochet hooks. There are no automated machines, no outsourced industrial factories, and no mass manufacturing. Because each item is crafted stitch by stitch, slight natural variations may occur, which is the hallmark of genuine handmade work.",
    },
    {
      q: 'Can I request a custom color?',
      a: "Yes, you can request custom color preferences for scarves, beanies, gloves, mufflers, and socks. Because we work with carefully selected wool yarns and natural blends, color feasibility strictly depends on current yarn stock availability. Gurjeet will personally check and confirm what shades can be crafted before any work begins.",
    },
    {
      q: 'How do I place an order?',
      a: `To maintain personal artisan attention, this website does not use automated online payment gateways. You can browse our collection, choose your preferred items, and send an order inquiry directly via WhatsApp or phone at ${BUSINESS_CONFIG.displayPhone}. Gurjeet will review your request, verify stock or yarn, and personally confirm the details, timeline, and order with you.`,
    },
    {
      q: 'How can I check availability?',
      a: `Pieces currently in studio stock are dispatched within 1–2 business days. Made-to-order creations are scheduled on Gurjeet's needles upon request. You can check availability on individual product pages or message Gurjeet directly on WhatsApp at ${BUSINESS_CONFIG.displayPhone} for an immediate status update.`,
    },
    {
      q: 'How long does a handmade item take?',
      a: "Handcrafting time depends on the size of the item, stitch pattern complexity, and how many pieces are currently on Gurjeet's needles. Typically, small items require 3 to 5 crafting days, while larger or intricate pieces take longer. Gurjeet will provide an honest, realistic crafting estimate when you inquire.",
    },
  ];

  // Form validation
  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Please enter your full name';
    }

    if (!formData.email.trim()) {
      errs.email = 'Please enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Please enter your phone number';
    } else if (formData.phone.trim().length < 8) {
      errs.phone = 'Please enter a valid phone number (at least 8 digits)';
    }

    if (!formData.subject.trim()) {
      errs.subject = 'Please select a subject';
    }

    if (!formData.message.trim()) {
      errs.message = 'Please enter your message';
    } else if (formData.message.trim().length < 10) {
      errs.message = 'Please provide a little more detail (at least 10 characters)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      // Focus first error field for accessibility
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const el = document.getElementById(`contact-${firstErrorField}`);
        if (el) el.focus();
      }
      return;
    }

    setSubmitting(true);

    try {
      // Send message to backend contact endpoint
      await api.post('/contact', formData);
      setSubmittedData({ ...formData });
      setSubmitSuccess(true);
      if (contactFormRef.current) {
        contactFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      console.error('Backend contact submission error:', err);
      setSubmitError(
        err.message || 'Unable to deliver your message to the studio. Please try again or message Gurjeet directly on WhatsApp.'
      );
      if (contactFormRef.current) {
        contactFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'Product Inquiry',
      message: '',
    });
    setErrors({});
    setSubmitSuccess(false);
    setSubmittedData(null);
    setSubmitError(null);
  };

  const scrollToForm = () => {
    if (contactFormRef.current) {
      contactFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const nameInput = document.getElementById('contact-name');
      if (nameInput) setTimeout(() => nameInput.focus(), 400);
    }
  };

  // Generate WhatsApp link with general pre-filled inquiry
  const generalWhatsAppUrl = BUSINESS_CONFIG.createWhatsAppUrl(
    "Hello Gurjeet's Handcraft, I have a question about your handmade woolen products. Can you please help me?"
  );

  // Generate WhatsApp link with pre-filled submitted form data
  const getSubmittedWhatsAppUrl = (data) => {
    if (!data) return generalWhatsAppUrl;
    const text = `Hello Gurjeet's Handcraft,\nI have submitted an inquiry through your website:\n\n*Name:* ${data.name}\n*Phone:* ${data.phone}\n*Subject:* ${data.subject}\n*Message:* ${data.message}\n\nLooking forward to hearing from you. Thank you!`;
    return BUSINESS_CONFIG.createWhatsAppUrl(text);
  };

  return (
    <main
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 sm:space-y-24"
      role="main"
      aria-labelledby="contact-page-title"
    >
      <SEO
        title="Contact Gurjeet's Handcraft | Studio Inquiries & Direct WhatsApp"
        description="Get in touch directly with Gurjeet for questions about handcrafted woolen scarves, custom commissions, sizing guidance, and order status updates."
        keywords={[
          'contact Gurjeet',
          'handmade wool inquiries',
          'WhatsApp artisan knitwear',
          'custom order phone number',
          'Himachal craft studio',
        ]}
        canonical="/contact"
      />

      {/* =========================================================================
          SECTION 1: HERO / HAVE A QUESTION?
          Simple, elegant and personal introduction
          ========================================================================= */}
      <header className="text-center space-y-4 pt-2 sm:pt-6">
        <div className="inline-flex items-center gap-2">
          <Badge variant="terracotta">Personal Connection</Badge>
          <span className="text-xs text-artisan-softBrown font-medium">
            &bull; Gurjeet's Handcraft
          </span>
        </div>

        <h1
          id="contact-page-title"
          className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-artisan-earthBrown tracking-tight"
        >
          Have a question?
        </h1>

        <p className="text-sm sm:text-base text-artisan-softBrown max-w-2xl mx-auto leading-relaxed">
          Every woolen scarf, beanie, glove, and muffler is personally crafted by Gurjeet.
          Whether you have a query about yarn shades, sizing, custom requests, or care,
          Gurjeet will respond to you personally.
        </p>
      </header>

      {/* =========================================================================
          SECTION 2: WAYS TO CONTACT
          - WhatsApp
          - Phone
          - Contact Form
          ========================================================================= */}
      <section aria-labelledby="ways-to-contact-heading" className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-artisan-terracotta">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ways to Contact</span>
          </div>
          <h2
            id="ways-to-contact-heading"
            className="font-serif text-2xl sm:text-3xl font-bold text-artisan-earthBrown"
          >
            How would you like to reach us?
          </h2>
          <p className="text-xs sm:text-sm text-artisan-softBrown">
            Choose the contact method most convenient for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* 1. WhatsApp Card */}
          <article
            aria-label="Contact via WhatsApp"
            className="rounded-3xl bg-artisan-cream border border-artisan-heather p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-[#25D366]/40 transition shadow-subtle group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 flex items-center justify-center text-[#25D366] group-hover:scale-105 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#25D366] block">
                  Fastest Response
                </span>
                <h3 className="font-serif text-xl font-bold text-artisan-earthBrown">
                  WhatsApp
                </h3>
              </div>
              <p className="text-xs text-artisan-softBrown leading-relaxed">
                Connect directly with Gurjeet for quick questions, yarn shade photographs, and real-time updates.
              </p>
              <div className="pt-2 border-t border-artisan-heather/70">
                <span className="text-[11px] text-artisan-softBrown block">WhatsApp Number</span>
                <span className="font-mono text-sm font-bold text-artisan-earthBrown">
                  {BUSINESS_CONFIG.displayPhone}
                </span>
              </div>
            </div>

            <a
              href={generalWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl bg-[#25D366] text-white text-xs sm:text-sm font-bold hover:bg-[#20ba59] transition shadow-subtle tap-target"
              aria-label={`Chat with Gurjeet on WhatsApp at ${BUSINESS_CONFIG.displayPhone}`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </article>

          {/* 2. Phone Call Card */}
          <article
            aria-label="Contact via Phone Call"
            className="rounded-3xl bg-artisan-cream border border-artisan-heather p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-artisan-terracotta/40 transition shadow-subtle group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-artisan-sandstone flex items-center justify-center text-artisan-earthBrown group-hover:scale-105 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-artisan-terracotta block">
                  Direct Speaking
                </span>
                <h3 className="font-serif text-xl font-bold text-artisan-earthBrown">
                  Phone
                </h3>
              </div>
              <p className="text-xs text-artisan-softBrown leading-relaxed">
                Prefer to speak personally? Call to discuss sizing, wool yarn textures, or bespoke crafting ideas.
              </p>
              <div className="pt-2 border-t border-artisan-heather/70">
                <span className="text-[11px] text-artisan-softBrown block">Query Number</span>
                <span className="font-mono text-sm font-bold text-artisan-earthBrown">
                  {BUSINESS_CONFIG.displayPhone}
                </span>
              </div>
            </div>

            <a
              href={`tel:${BUSINESS_CONFIG.phone}`}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl bg-artisan-ivory border border-artisan-heather text-artisan-earthBrown text-xs sm:text-sm font-bold hover:bg-white transition shadow-subtle tap-target"
              aria-label={`Call query number ${BUSINESS_CONFIG.displayPhone}`}
            >
              <Phone className="w-4 h-4 text-artisan-terracotta" />
              <span>Call {BUSINESS_CONFIG.displayPhone}</span>
            </a>
          </article>

          {/* 3. Contact Form Quick Jump Card */}
          <article
            aria-label="Contact via Online Form"
            className="rounded-3xl bg-artisan-cream border border-artisan-heather p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-artisan-earthBrown/40 transition shadow-subtle group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-artisan-ivory border border-artisan-heather flex items-center justify-center text-artisan-earthBrown group-hover:scale-105 transition-transform">
                <Send className="w-6 h-6 text-artisan-earthBrown" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-artisan-softBrown block">
                  Written Message
                </span>
                <h3 className="font-serif text-xl font-bold text-artisan-earthBrown">
                  Contact Form
                </h3>
              </div>
              <p className="text-xs text-artisan-softBrown leading-relaxed">
                Send a message directly through the website below. Gurjeet will review your note and respond personally.
              </p>
              <div className="pt-2 border-t border-artisan-heather/70">
                <span className="text-[11px] text-artisan-softBrown block">Response Time</span>
                <span className="text-xs font-semibold text-artisan-earthBrown">
                  Personal review by Gurjeet
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={scrollToForm}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl bg-artisan-earthBrown text-white text-xs sm:text-sm font-bold hover:bg-artisan-espresso transition shadow-subtle tap-target"
            >
              <span>Fill Contact Form</span>
              <ArrowDown className="w-4 h-4" />
            </button>
          </article>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: STUDIO DETAILS (STRICTLY CONFIGURABLE PLACEHOLDERS - NO INVENTED INFO)
          Do not invent: email, address, social media, opening hours.
          ========================================================================= */}
      <aside
        aria-label="Configurable studio information placeholders"
        className="rounded-3xl bg-artisan-sandstone/30 border border-artisan-heather/80 p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-artisan-heather/60 pb-4 mb-5">
          <div>
            <h3 className="font-serif text-base font-bold text-artisan-earthBrown flex items-center gap-2">
              <Clock className="w-4 h-4 text-artisan-terracotta" />
              <span>Studio Information & Configurable Placeholders</span>
            </h3>
            <p className="text-xs text-artisan-softBrown mt-0.5">
              To preserve authentic artisan integrity, non-public details are marked as configurable placeholders until officially published.
            </p>
          </div>
          <Badge variant="craft">Authentic Record</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Email Placeholder */}
          <div className="p-3.5 rounded-2xl bg-artisan-ivory/80 border border-artisan-heather/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-artisan-earthBrown">
              <Mail className="w-3.5 h-3.5 text-artisan-terracotta" />
              <span>Studio Email</span>
            </div>
            <p className="text-[11px] text-artisan-softBrown font-mono break-all">
              {BUSINESS_CONFIG.email || BUSINESS_CONFIG.emailPlaceholder}
            </p>
          </div>

          {/* Address Placeholder */}
          <div className="p-3.5 rounded-2xl bg-artisan-ivory/80 border border-artisan-heather/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-artisan-earthBrown">
              <MapPin className="w-3.5 h-3.5 text-artisan-terracotta" />
              <span>Studio Address</span>
            </div>
            <p className="text-[11px] text-artisan-softBrown font-mono">
              {BUSINESS_CONFIG.address || BUSINESS_CONFIG.studioLocationPlaceholder}
            </p>
          </div>

          {/* Opening Hours Placeholder */}
          <div className="p-3.5 rounded-2xl bg-artisan-ivory/80 border border-artisan-heather/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-artisan-earthBrown">
              <Clock className="w-3.5 h-3.5 text-artisan-terracotta" />
              <span>Opening Hours</span>
            </div>
            <p className="text-[11px] text-artisan-softBrown font-mono">
              {BUSINESS_CONFIG.openingHours || BUSINESS_CONFIG.openingHoursPlaceholder}
            </p>
          </div>

          {/* Social Media Placeholder */}
          <div className="p-3.5 rounded-2xl bg-artisan-ivory/80 border border-artisan-heather/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-artisan-earthBrown">
              <Share2 className="w-3.5 h-3.5 text-artisan-terracotta" />
              <span>Social Media</span>
            </div>
            <p className="text-[11px] text-artisan-softBrown font-mono">
              {BUSINESS_CONFIG.socialMediaPlaceholder}
            </p>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          SECTION 4: CONTACT FORM
          Name, Email, Phone, Subject, Message
          + Confirmation & WhatsApp Continuation
          ========================================================================= */}
      <section
        ref={contactFormRef}
        id="contact-form"
        aria-labelledby="contact-form-title"
        className="rounded-3xl bg-artisan-cream border border-artisan-heather p-6 sm:p-10 lg:p-12 space-y-8 shadow-card scroll-mt-24"
      >
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-artisan-terracotta">
            <Send className="w-3.5 h-3.5" />
            <span>Send a Direct Message</span>
          </div>
          <h2
            id="contact-form-title"
            className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-artisan-earthBrown"
          >
            Contact Form
          </h2>
          <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
            Fill in the details below. Gurjeet personally reads all inquiries and will reply to you as soon as possible.
          </p>
        </div>

        {submitSuccess && submittedData ? (
          /* ================= SUCCESS CONFIRMATION STATE ================= */
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="p-6 sm:p-10 rounded-2xl bg-artisan-ivory border border-artisan-heather space-y-6 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl shadow-subtle">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-artisan-earthBrown">
                Thank you, {submittedData.name}!
              </h3>
              <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
                Your message regarding "<strong>{submittedData.subject}</strong>" has been received.
                Gurjeet will review it and connect with you personally on phone or email.
              </p>
            </div>

            {/* Submitted Summary Box */}
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-artisan-cream border border-artisan-heather/70 text-left text-xs space-y-1.5 text-artisan-earthBrown">
              <div>
                <span className="font-bold text-artisan-softBrown">Phone / WhatsApp:</span>{' '}
                {submittedData.phone}
              </div>
              <div>
                <span className="font-bold text-artisan-softBrown">Email:</span>{' '}
                {submittedData.email}
              </div>
              <div>
                <span className="font-bold text-artisan-softBrown">Subject:</span>{' '}
                {submittedData.subject}
              </div>
              <div className="pt-1 text-artisan-softBrown italic">
                "{submittedData.message}"
              </div>
            </div>

            {/* Pre-Filled WhatsApp Continuation CTA */}
            <div className="pt-2 max-w-md mx-auto space-y-3">
              <div className="text-xs font-semibold text-artisan-earthBrown">
                Want a faster reply? Continue this conversation directly on WhatsApp:
              </div>
              <a
                href={getSubmittedWhatsAppUrl(submittedData)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full py-3.5 px-5 rounded-2xl bg-[#25D366] text-white text-xs sm:text-sm font-bold hover:bg-[#20ba59] transition shadow-subtle tap-target"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Send Pre-Filled Message on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleResetForm}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-artisan-softBrown hover:text-artisan-earthBrown underline pt-2 tap-target"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Send Another Message</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* ================= FORM INPUT STATE ================= */
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {submitError && (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Field 1: Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-bold text-artisan-earthBrown"
                >
                  Your Name <span className="text-artisan-terracotta" aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'contact-name-error' : undefined}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className={`w-full px-4 py-3 rounded-2xl bg-artisan-ivory border text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:ring-2 focus:ring-artisan-terracotta/40 transition tap-target ${
                    errors.name ? 'border-rose-400 bg-rose-50/40' : 'border-artisan-heather'
                  }`}
                />
                {errors.name && (
                  <p id="contact-name-error" className="text-[11px] text-rose-600 font-medium">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Field 2: Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-bold text-artisan-earthBrown"
                >
                  Your Email <span className="text-artisan-terracotta" aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'contact-email-error' : undefined}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="priya@example.com"
                  className={`w-full px-4 py-3 rounded-2xl bg-artisan-ivory border text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:ring-2 focus:ring-artisan-terracotta/40 transition tap-target ${
                    errors.email ? 'border-rose-400 bg-rose-50/40' : 'border-artisan-heather'
                  }`}
                />
                {errors.email && (
                  <p id="contact-email-error" className="text-[11px] text-rose-600 font-medium">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Field 3: Phone */}
              <div className="space-y-1.5">
                <label
                  htmlFor="contact-phone"
                  className="block text-xs font-bold text-artisan-earthBrown"
                >
                  Phone / WhatsApp Number <span className="text-artisan-terracotta" aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  required
                  aria-required="true"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 7018183172"
                  className={`w-full px-4 py-3 rounded-2xl bg-artisan-ivory border text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:ring-2 focus:ring-artisan-terracotta/40 transition tap-target ${
                    errors.phone ? 'border-rose-400 bg-rose-50/40' : 'border-artisan-heather'
                  }`}
                />
                {errors.phone && (
                  <p id="contact-phone-error" className="text-[11px] text-rose-600 font-medium">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Field 4: Subject */}
              <div className="space-y-1.5">
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-bold text-artisan-earthBrown"
                >
                  Subject <span className="text-artisan-terracotta" aria-hidden="true">*</span>
                </label>
                <select
                  id="contact-subject"
                  name="subject"
                  required
                  aria-required="true"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:ring-2 focus:ring-artisan-terracotta/40 transition tap-target"
                >
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Field 5: Message */}
            <div className="space-y-1.5">
              <label
                htmlFor="contact-message"
                className="block text-xs font-bold text-artisan-earthBrown"
              >
                Your Message <span className="text-artisan-terracotta" aria-hidden="true">*</span>
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                required
                aria-required="true"
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'contact-message-error' : undefined}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can Gurjeet help you with your handmade woolen inquiry?"
                className={`w-full px-4 py-3 rounded-2xl bg-artisan-ivory border text-xs sm:text-sm text-artisan-earthBrown focus:outline-none focus:ring-2 focus:ring-artisan-terracotta/40 transition tap-target ${
                  errors.message ? 'border-rose-400 bg-rose-50/40' : 'border-artisan-heather'
                }`}
              />
              {errors.message && (
                <p id="contact-message-error" className="text-[11px] text-rose-600 font-medium">
                  {errors.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              loading={submitting}
              className="w-full justify-center text-sm py-4 shadow-subtle tap-target"
            >
              <Send className="w-4 h-4 mr-2" />
              <span>Send Message to Gurjeet</span>
            </Button>
          </form>
        )}
      </section>

      {/* =========================================================================
          SECTION 5: DEDICATED WHATSAPP CTA BANNER (WITH PRE-FILLED MESSAGE)
          Quick direct consultation button
          ========================================================================= */}
      <section
        aria-label="Direct WhatsApp Consultation"
        className="rounded-3xl bg-artisan-ivory border border-artisan-heather p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-subtle"
      >
        <div className="space-y-1.5 text-center md:text-left max-w-xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#25D366]">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Instant Chat Consultation</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-artisan-earthBrown">
            Prefer a direct conversation?
          </h3>
          <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
            Message Gurjeet directly on WhatsApp at <strong>{BUSINESS_CONFIG.displayPhone}</strong> with your questions regarding yarn availability, custom requests, or handmade items.
          </p>
        </div>

        <a
          href={generalWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-[#25D366] text-white text-xs sm:text-sm font-bold hover:bg-[#20ba59] transition shadow-card tap-target flex-shrink-0"
          aria-label={`Chat with Gurjeet on WhatsApp at ${BUSINESS_CONFIG.displayPhone}`}
        >
          <MessageCircle className="w-5 h-5" />
          <span>Chat on WhatsApp: {BUSINESS_CONFIG.displayPhone}</span>
        </a>
      </section>

      {/* =========================================================================
          SECTION 6: BEAUTIFUL FAQ SECTION
          Useful questions only, strictly NO unsupported promises:
          - Are products handmade?
          - Can I request a custom color?
          - How do I place an order?
          - How can I check availability?
          - How long does a handmade item take?
          ========================================================================= */}
      <section aria-labelledby="faq-section-title" className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="craft">Frequently Asked Questions</Badge>
          <h2
            id="faq-section-title"
            className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown"
          >
            Useful Questions & Answers
          </h2>
          <p className="text-xs sm:text-sm text-artisan-softBrown">
            Transparent answers about our craft process, orders, and realistic timelines.
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto" role="region" aria-label="FAQ Accordion">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            const headingId = `faq-heading-${idx}`;
            const panelId = `faq-panel-${idx}`;

            return (
              <div
                key={idx}
                className="rounded-2xl bg-artisan-cream border border-artisan-heather overflow-hidden transition shadow-subtle"
              >
                <h3>
                  <button
                    type="button"
                    id={headingId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-xs sm:text-sm font-serif font-bold text-artisan-earthBrown hover:text-artisan-terracotta transition tap-target focus:outline-none focus-visible:ring-2 focus-visible:ring-artisan-terracotta"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-artisan-softBrown transition-transform duration-200 flex-shrink-0 ml-3 ${
                        isOpen ? 'rotate-180 text-artisan-terracotta' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={headingId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-artisan-heather/70 bg-artisan-ivory/60"
                    >
                      <p className="p-5 text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
