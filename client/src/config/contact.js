/**
 * Single Configurable Business Contact & Direct WhatsApp Configuration
 * Gurjeet's Handcraft - Pure Artisan Atelier
 *
 * Single Source of Truth:
 * - Single configurable business contact value (BUSINESS_CONTACT_NUMBER)
 * - Derived from environment variable (VITE_BUSINESS_PHONE) with verified studio number fallback (7018183172)
 * - Feature toggle: VITE_WHATSAPP_ENABLED (true by default, easily disabled)
 * - Generates verified pre-filled inquiries:
 *     1. "Ask About This Product" (Product name + Product inquiry)
 *     2. "Contact Gurjeet" (Custom orders / Bespoke consultation)
 *     3. "Ask About Availability" (Availability / Yarn stock questions)
 */

// Helper to safely read env in both browser (Vite) and Node.js testing environments
const getEnvVar = (key, fallback) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta?.env?.[key] !== undefined) {
      return import.meta.env[key];
    }
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process?.env?.[key] !== undefined) {
      return process.env[key];
    }
  } catch (e) {}
  return fallback;
};

// Single configurable business contact value (strictly verified studio number, no invented numbers)
export const BUSINESS_CONTACT_NUMBER = getEnvVar('VITE_BUSINESS_PHONE', '7018183172');

export const COUNTRY_CODE = getEnvVar('VITE_WHATSAPP_COUNTRY_CODE', '91');

// Full WhatsApp international number (e.g. 917018183172)
export const WHATSAPP_FULL_NUMBER = `${COUNTRY_CODE}${BUSINESS_CONTACT_NUMBER}`;

// Formatted display phone (e.g. +91 70181 83172)
export const FORMATTED_DISPLAY_PHONE = `+${COUNTRY_CODE} ${BUSINESS_CONTACT_NUMBER.slice(0, 5)} ${BUSINESS_CONTACT_NUMBER.slice(5)}`;

// Feature Toggle: Easy to disable globally via env or runtime flag
export const IS_DIRECT_CONTACT_ENABLED =
  getEnvVar('VITE_WHATSAPP_ENABLED', 'true') !== 'false';

export const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_FULL_NUMBER}`;

/**
 * Base helper to create a WhatsApp link
 * Returns empty string if feature is disabled
 * @param {string} message - Pre-filled message
 * @returns {string} WhatsApp URL or empty string
 */
export const createWhatsAppUrl = (message = '') => {
  if (!IS_DIRECT_CONTACT_ENABLED) return '';
  if (!message) return WHATSAPP_BASE_URL;
  return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message.trim())}`;
};

/**
 * 1. Product Page: "Ask About This Product"
 * Prepared message containing:
 * - Product name
 * - Product inquiry
 */
export const getAskAboutProductMessage = ({
  productName = 'Handmade Piece',
  selectedColor = '',
  price = null,
  productUrl = '',
} = {}) => {
  let text = `Hello Gurjeet,\nI have an inquiry regarding: *${productName}*\n`;
  if (selectedColor) {
    text += `• Selected Color/Variant: *${selectedColor}*\n`;
  }
  if (price) {
    text += `• Price: *₹${Number(price).toLocaleString('en-IN')}*\n`;
  }
  if (productUrl) {
    text += `• Product Link: ${productUrl}\n`;
  }
  text += `\nI would like to inquire about this piece: Could you share more details about the wool texture, stitch work, and crafting/delivery timeline?`;
  return text;
};

export const getAskAboutProductUrl = (params = {}) => {
  return createWhatsAppUrl(getAskAboutProductMessage(params));
};

/**
 * 2. Custom Orders: "Contact Gurjeet"
 * Prepared message for custom commissions and bespoke requests
 */
export const getContactGurjeetMessage = (customDetails = {}) => {
  let text = `Hello Gurjeet,\nI would like to discuss a custom handmade order with you.\n`;
  if (customDetails.productType) {
    text += `• Desired Creation: *${customDetails.productType}*\n`;
  }
  if (customDetails.colorPreference) {
    text += `• Preferred Yarn Color: *${customDetails.colorPreference}*\n`;
  }
  if (customDetails.size) {
    text += `• Desired Size / Dimensions: *${customDetails.size}*\n`;
  }
  if (customDetails.designPattern) {
    text += `• Pattern / Stitch Preference: *${customDetails.designPattern}*\n`;
  }
  if (customDetails.additionalNotes) {
    text += `• Notes: ${customDetails.additionalNotes}\n`;
  }
  text += `\nPlease let me know your current schedule for custom commissions and yarn options. Looking forward to crafting together!`;
  return text;
};

export const getContactGurjeetUrl = (customDetails = {}) => {
  return createWhatsAppUrl(getContactGurjeetMessage(customDetails));
};

/**
 * 3. Availability Questions: "Ask About Availability"
 * Prepared message asking specifically about yarn and product stock availability
 */
export const getAskAboutAvailabilityMessage = ({
  productName = '',
  color = '',
  productUrl = '',
} = {}) => {
  let text = `Hello Gurjeet,\nI would like to ask about availability`;
  if (productName) {
    text += ` for: *${productName}*`;
  }
  if (color) {
    text += ` in the *${color}* shade`;
  }
  text += `.\n`;
  if (productUrl) {
    text += `Product Link: ${productUrl}\n`;
  }
  text += `\nIs this handcrafted creation currently in studio stock and ready to ship, or can it be made to order?`;
  return text;
};

export const getAskAboutAvailabilityUrl = (params = {}) => {
  return createWhatsAppUrl(getAskAboutAvailabilityMessage(params));
};

export const CONTACT_CONFIG = {
  phone: BUSINESS_CONTACT_NUMBER,
  displayPhone: FORMATTED_DISPLAY_PHONE,
  whatsappNumber: WHATSAPP_FULL_NUMBER,
  whatsappBaseUrl: WHATSAPP_BASE_URL,
  isEnabled: IS_DIRECT_CONTACT_ENABLED,
  createWhatsAppUrl,
  getAskAboutProductMessage,
  getAskAboutProductUrl,
  getContactGurjeetMessage,
  getContactGurjeetUrl,
  getAskAboutAvailabilityMessage,
  getAskAboutAvailabilityUrl,
};

export default CONTACT_CONFIG;
