import React from 'react';
import { MessageCircle, Phone, HelpCircle, Sparkles } from 'lucide-react';
import {
  CONTACT_CONFIG,
  getAskAboutProductUrl,
  getContactGurjeetUrl,
  getAskAboutAvailabilityUrl,
  createWhatsAppUrl,
} from '../../config/contact';

/**
 * Reusable Direct Contact & WhatsApp Button
 *
 * Supports the 3 specified contact actions:
 * 1. "Ask About This Product" (product name + product inquiry)
 * 2. "Contact Gurjeet" (custom orders / bespoke inquiry)
 * 3. "Ask About Availability" (stock / yarn availability questions)
 *
 * Easily enabled/disabled via VITE_WHATSAPP_ENABLED
 */
export const DirectContactButton = ({
  action = 'ask_product',
  product = null,
  productName = '',
  selectedColor = '',
  price = null,
  details = {},
  label,
  variant = 'whatsapp',
  size = 'md',
  fullWidth = false,
  className = '',
  fallbackToCall = false,
  showIcon = true,
  onClick,
}) => {
  // If feature is disabled globally
  if (!CONTACT_CONFIG.isEnabled) {
    if (fallbackToCall) {
      return (
        <a
          href={`tel:${CONTACT_CONFIG.phone}`}
          className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-artisan-heather bg-artisan-cream text-artisan-earthBrown font-semibold hover:bg-artisan-sandstone transition tap-target ${
            size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-6 py-4 text-base' : 'px-4 py-2.5 text-sm'
          } ${fullWidth ? 'w-full' : ''} ${className}`}
          title={`Call studio at ${CONTACT_CONFIG.displayPhone}`}
          aria-label={`Call studio at ${CONTACT_CONFIG.displayPhone}`}
        >
          {showIcon && <Phone className="w-4 h-4 text-artisan-softBrown" />}
          <span>Call Studio: {CONTACT_CONFIG.displayPhone}</span>
        </a>
      );
    }
    return null; // Gracefully hidden when disabled
  }

  // Derive target URL and default label based on action
  let url = '';
  let defaultLabel = '';
  let ActionIcon = MessageCircle;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const effectiveTitle = productName || product?.title || 'Handmade Creation';
  const effectivePrice = price ?? product?.price;
  const effectiveColor = selectedColor || product?.availableColors?.[0] || '';

  switch (action) {
    case 'ask_product':
      defaultLabel = 'Ask About This Product';
      url = getAskAboutProductUrl({
        productName: effectiveTitle,
        selectedColor: effectiveColor,
        price: effectivePrice,
        productUrl: currentUrl,
      });
      break;

    case 'contact_gurjeet':
      defaultLabel = 'Contact Gurjeet';
      ActionIcon = Sparkles;
      url = getContactGurjeetUrl(details);
      break;

    case 'ask_availability':
      defaultLabel = 'Ask About Availability';
      ActionIcon = HelpCircle;
      url = getAskAboutAvailabilityUrl({
        productName: effectiveTitle,
        color: effectiveColor,
        productUrl: currentUrl,
      });
      break;

    default:
      defaultLabel = 'Contact Gurjeet';
      url = createWhatsAppUrl();
      break;
  }

  const finalLabel = label || defaultLabel;

  // Visual variants
  const variantClasses = {
    whatsapp:
      'bg-[#25D366] text-white hover:bg-[#20ba59] shadow-subtle border border-transparent font-bold',
    artisan:
      'bg-artisan-terracotta text-white hover:bg-artisan-terracottaDark shadow-subtle border border-transparent font-semibold',
    secondary:
      'bg-artisan-cream border border-artisan-heather text-artisan-earthBrown hover:bg-artisan-sandstone font-semibold',
    outline:
      'bg-transparent border border-artisan-heather text-artisan-earthBrown hover:border-artisan-terracotta hover:text-artisan-terracotta font-semibold',
    subtle:
      'bg-transparent text-artisan-earthBrown/85 hover:text-artisan-terracotta font-semibold underline underline-offset-4',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2.5 text-xs sm:text-sm rounded-2xl gap-2',
    lg: 'px-6 py-3.5 text-sm sm:text-base rounded-2xl gap-2.5',
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`inline-flex items-center justify-center transition tap-target select-none ${
        variantClasses[variant] || variantClasses.whatsapp
      } ${sizeClasses[size] || sizeClasses.md} ${fullWidth ? 'w-full' : ''} ${className}`}
      title={`${finalLabel} on WhatsApp`}
      aria-label={`${finalLabel} on WhatsApp`}
    >
      {showIcon && <ActionIcon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      <span>{finalLabel}</span>
    </a>
  );
};

export default DirectContactButton;
