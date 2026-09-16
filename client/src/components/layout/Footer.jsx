import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Sparkles,
  MessageCircle,
  Phone,
  Clock,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Instagram,
  Facebook,
  Share2,
} from 'lucide-react';
import { BUSINESS_CONFIG } from '../../config/business';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  // WhatsApp CTA link with polite pre-filled message
  const footerWhatsAppUrl = BUSINESS_CONFIG.createWhatsAppUrl(
    'Hello Gurjeet, I visited your website and would like to inquire about your handmade woolen creations!'
  );

  return (
    <footer
      role="contentinfo"
      aria-label="Artisan Studio Footer"
      className="bg-artisan-cream border-t border-artisan-heather mt-20 text-artisan-earthBrown"
    >
      {/* Top Banner: Custom Orders Highlight / Artisan Promise */}
      <div className="border-b border-artisan-heather/70 bg-artisan-ivory/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-artisan-terracotta">
                <Sparkles className="w-4 h-4" />
                <span>Bespoke Handcrafted Woolens</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-artisan-earthBrown tracking-tight">
                Looking for a Custom Color, Pattern, or Size?
              </h3>
              <p className="text-sm text-artisan-softBrown max-w-2xl">
                Gurjeet handcrafts each item with personal care. Share your preferred yarn shade, dimensions, or pattern idea.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/custom-orders"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-artisan-terracotta text-white text-xs font-semibold hover:bg-artisan-terracotta/90 transition shadow-subtle tap-target"
              >
                <span>Request a Custom Order</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={footerWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-[#25D366]/50 text-artisan-earthBrown text-xs font-semibold hover:bg-[#25D366]/10 transition tap-target"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Multi-Section Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Section 1: Brand Statement & Origin (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img
                src="/assets/yarn-icon.svg"
                alt="Gurjeet's Handcraft Yarn Brandmark"
                className="w-8 h-8 group-hover:rotate-12 transition-transform duration-500"
              />
              <span className="font-serif text-2xl font-bold tracking-tight text-artisan-earthBrown">
                Gurjeet's Handcraft
              </span>
            </Link>

            <p className="text-sm text-artisan-softBrown leading-relaxed max-w-md">
              A personal handmade woolen craft business by Gurjeet. Every scarf, beanie, glove, and muffler is lovingly created stitch by stitch with crochet hooks and knitting needles. No mass production, no synthetic factories—just pure wool and genuine human dedication.
            </p>

            <div className="inline-flex items-center gap-2 text-xs font-medium text-artisan-earthBrown bg-artisan-sandstone/70 px-3.5 py-2 rounded-2xl border border-artisan-heather">
              <Heart className="w-3.5 h-3.5 text-artisan-terracotta fill-artisan-terracotta flex-shrink-0" />
              <span>
                <strong>"Handmade by Gurjeet"</strong> &bull; Slow craft atelier
              </span>
            </div>

            {/* Configurable Social Links (Placeholders clearly designated) */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-artisan-softBrown font-semibold block">
                Studio Channels (Configurable Placeholders)
              </span>
              <div className="flex items-center gap-2.5">
                {BUSINESS_CONFIG.socialPlaceholders.instagram ? (
                  <a
                    href={BUSINESS_CONFIG.socialPlaceholders.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-artisan-ivory border border-artisan-heather text-artisan-earthBrown hover:text-artisan-terracotta transition tap-target"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    type="button"
                    title="Instagram placeholder: authentic handle will be configured when published"
                    className="p-2.5 rounded-xl bg-artisan-ivory/60 border border-artisan-heather/70 text-artisan-softBrown/70 cursor-default tap-target"
                    aria-label="Instagram placeholder"
                  >
                    <Instagram className="w-4 h-4" />
                  </button>
                )}

                {BUSINESS_CONFIG.socialPlaceholders.facebook ? (
                  <a
                    href={BUSINESS_CONFIG.socialPlaceholders.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-artisan-ivory border border-artisan-heather text-artisan-earthBrown hover:text-artisan-terracotta transition tap-target"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    type="button"
                    title="Facebook placeholder: authentic page will be configured when published"
                    className="p-2.5 rounded-xl bg-artisan-ivory/60 border border-artisan-heather/70 text-artisan-softBrown/70 cursor-default tap-target"
                    aria-label="Facebook placeholder"
                  >
                    <Facebook className="w-4 h-4" />
                  </button>
                )}

                {BUSINESS_CONFIG.socialPlaceholders.pinterest ? (
                  <a
                    href={BUSINESS_CONFIG.socialPlaceholders.pinterest}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-artisan-ivory border border-artisan-heather text-artisan-earthBrown hover:text-artisan-terracotta transition tap-target"
                    aria-label="Pinterest"
                  >
                    <Share2 className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    type="button"
                    title="Pinterest placeholder: authentic board will be configured when published"
                    className="p-2.5 rounded-xl bg-artisan-ivory/60 border border-artisan-heather/70 text-artisan-softBrown/70 cursor-default tap-target"
                    aria-label="Pinterest placeholder"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}

                <span className="text-[10px] text-artisan-softBrown italic pl-1">
                  (Authentic handles will be linked once live)
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-artisan-earthBrown">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-artisan-softBrown">
              <li>
                <Link to="/" className="hover:text-artisan-terracotta transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-artisan-terracotta transition">
                  Shop Handcrafted Woolens
                </Link>
              </li>
              <li>
                <Link to="/our-story" className="hover:text-artisan-terracotta transition">
                  Our Story & Gurjeet's Craft
                </Link>
              </li>
              <li>
                <Link to="/how-its-made" className="hover:text-artisan-terracotta transition">
                  How It's Made
                </Link>
              </li>
              <li>
                <Link to="/custom-orders" className="hover:text-artisan-terracotta transition">
                  Custom Orders
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-artisan-terracotta transition">
                  Contact Studio
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-artisan-terracotta transition">
                  Saved Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 3: Customer Links & Policies */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-artisan-earthBrown">
              Customer Links
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-artisan-softBrown">
              <li>
                <Link
                  to="/shipping-information"
                  className="hover:text-artisan-terracotta transition flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5 text-artisan-softBrown" />
                  <span>Shipping Information</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/returns-information"
                  className="hover:text-artisan-terracotta transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-artisan-softBrown" />
                  <span>Returns & Exchanges</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-artisan-terracotta transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-artisan-softBrown" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-artisan-terracotta transition">
                  Terms of Craft
                </Link>
              </li>
              <li>
                <Link to="/how-its-made" className="hover:text-artisan-terracotta transition">
                  Wool Care Guide
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-artisan-terracotta transition">
                  My Inquiries & Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 4: Contact, WhatsApp & Phone CTA (Strictly Centralized) */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-artisan-earthBrown">
              Contact & Inquiries
            </h4>

            <p className="text-xs text-artisan-softBrown leading-relaxed">
              Have questions about yarn shades, sizing, or timelines? Connect directly with Gurjeet:
            </p>

            {/* WhatsApp CTA Button */}
            <a
              href={footerWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-[#25D366]/50 text-artisan-earthBrown hover:bg-[#25D366]/10 transition tap-target group"
            >
              <div className="w-7 h-7 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-artisan-earthBrown group-hover:text-[#25D366] transition">
                  WhatsApp Gurjeet
                </span>
                <span className="font-mono text-xs font-semibold text-artisan-softBrown">
                  {BUSINESS_CONFIG.displayPhone}
                </span>
              </div>
            </a>

            {/* Phone CTA Button */}
            <a
              href={`tel:${BUSINESS_CONFIG.phone}`}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-artisan-heather text-artisan-earthBrown hover:bg-artisan-sandstone/40 transition tap-target group"
            >
              <div className="w-7 h-7 rounded-full bg-artisan-sandstone flex items-center justify-center flex-shrink-0">
                <Phone className="w-3.5 h-3.5 text-artisan-earthBrown" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-artisan-earthBrown">
                  Phone Query Call
                </span>
                <span className="font-mono text-xs font-semibold text-artisan-softBrown">
                  {BUSINESS_CONFIG.displayPhone}
                </span>
              </div>
            </a>

            {/* Studio Hours */}
            <div className="flex items-start gap-2 pt-1 text-[11px] text-artisan-softBrown">
              <Clock className="w-3.5 h-3.5 text-artisan-softBrown flex-shrink-0 mt-0.5" />
              <span>{BUSINESS_CONFIG.openingHours || BUSINESS_CONFIG.openingHoursPlaceholder}</span>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-14 pt-8 border-t border-artisan-heather/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-artisan-softBrown">
          <p>
            &copy; {currentYear} Gurjeet's Handcraft. All creations personally handmade.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link to="/privacy-policy" className="hover:text-artisan-terracotta transition">
              Privacy Policy
            </Link>
            <span className="text-artisan-heather" aria-hidden="true">&bull;</span>
            <Link to="/terms" className="hover:text-artisan-terracotta transition">
              Terms of Craft
            </Link>
            <span className="text-artisan-heather" aria-hidden="true">&bull;</span>
            <Link to="/shipping-information" className="hover:text-artisan-terracotta transition">
              Shipping Information
            </Link>
            <span className="text-artisan-heather" aria-hidden="true">&bull;</span>
            <Link to="/returns-information" className="hover:text-artisan-terracotta transition">
              Returns & Exchange
            </Link>
          </div>

          <p className="flex items-center gap-1 font-medium text-artisan-earthBrown">
            Crafted with{' '}
            <Heart className="w-3.5 h-3.5 text-artisan-terracotta fill-artisan-terracotta inline" />{' '}
            by Gurjeet
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
