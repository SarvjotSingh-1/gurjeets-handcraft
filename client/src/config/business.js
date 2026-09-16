/**
 * Centralized Business Configuration
 * Uses single contact configuration from ./contact.js to avoid duplicate phone definitions
 */

import {
  BUSINESS_CONTACT_NUMBER,
  FORMATTED_DISPLAY_PHONE,
  WHATSAPP_FULL_NUMBER,
  WHATSAPP_BASE_URL,
  IS_DIRECT_CONTACT_ENABLED,
  createWhatsAppUrl,
  getAskAboutProductUrl,
  getContactGurjeetUrl,
  getAskAboutAvailabilityUrl,
  CONTACT_CONFIG,
} from './contact';

export const QUERY_PHONE = BUSINESS_CONTACT_NUMBER;
export const FORMATTED_PHONE = FORMATTED_DISPLAY_PHONE;
export const WHATSAPP_COUNTRY_CODE = '91';
export const WHATSAPP_NUMBER = WHATSAPP_FULL_NUMBER;
export {
  WHATSAPP_BASE_URL,
  createWhatsAppUrl,
  getAskAboutProductUrl,
  getContactGurjeetUrl,
  getAskAboutAvailabilityUrl,
  CONTACT_CONFIG,
};

export const BUSINESS_CONFIG = {
  businessName: "Gurjeet's Handcraft",
  artisanName: 'Gurjeet',
  phone: BUSINESS_CONTACT_NUMBER,
  displayPhone: FORMATTED_DISPLAY_PHONE,
  whatsappNumber: WHATSAPP_FULL_NUMBER,
  whatsappBaseUrl: WHATSAPP_BASE_URL,
  isWhatsAppEnabled: IS_DIRECT_CONTACT_ENABLED,
  createWhatsAppUrl,
  getAskAboutProductUrl,
  getContactGurjeetUrl,
  getAskAboutAvailabilityUrl,

  // Configurable Placeholders - strictly no invented personal details
  emailPlaceholder: '[Configurable Placeholder: Email to be provided by owner]',
  studioLocationPlaceholder: '[Configurable Placeholder: Address to be provided by owner]',
  openingHoursPlaceholder: '[Configurable Placeholder: Opening hours to be provided by owner]',
  socialMediaPlaceholder: '[Configurable Placeholder: Social channels to be linked by owner]',

  // Null until provided by owner
  email: null,
  address: null,
  openingHours: null,
  socialPlaceholders: {
    instagram: null,
    facebook: null,
    pinterest: null,
  },

  confirmationDisclaimer:
    'Sending an order request or WhatsApp message does not automatically confirm your order. Every piece is handcrafted by Gurjeet, who will manually confirm yarn availability, feasibility, and crafting timelines with you.',

  /**
   * Builds pre-filled WhatsApp URL for a specific product inquiry
   */
  getProductInquiryUrl: ({
    productName,
    quantity = 1,
    price,
    selectedColor = '',
    productUrl = '',
  }) => {
    return getAskAboutProductUrl({
      productName,
      selectedColor,
      price,
      productUrl,
    });
  },

  /**
   * Builds pre-filled WhatsApp URL for a submitted order request
   */
  getOrderRequestWhatsAppUrl: ({
    orderNumber,
    name,
    totalAmount,
    items = [],
  }) => {
    let text = `Hello Gurjeet's Handcraft,\nI have submitted an order request on your website:\n\n`;
    text += `*Order Request Number:* ${orderNumber}\n`;
    text += `*Customer Name:* ${name}\n\n`;
    text += `*Requested Products:*\n`;

    items.forEach((item, index) => {
      const color = item.selectedColor ? ` (${item.selectedColor})` : '';
      const title = item.title || item.product?.title || 'Handmade Woolen Piece';
      const itemPrice = item.unitPrice || item.product?.price || 0;
      text += `${index + 1}. ${title}${color} — Quantity: ${item.quantity} (₹${(
        itemPrice * item.quantity
      ).toLocaleString('en-IN')})\n`;
    });

    if (totalAmount) {
      text += `\n*Estimated Total:* ₹${totalAmount.toLocaleString('en-IN')}\n\n`;
    } else {
      text += `\n`;
    }
    text += `*Request:* Please check availability, final price, and delivery details. Looking forward to your confirmation!`;

    return createWhatsAppUrl(text);
  },
};

export default BUSINESS_CONFIG;
