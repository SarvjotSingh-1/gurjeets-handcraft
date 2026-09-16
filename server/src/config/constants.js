/**
 * Centralized Backend Constants & Business Configuration
 *
 * WhatsApp & Phone: 7018183172
 * Direct WhatsApp Link: https://wa.me/917018183172
 */

export const ORDER_STATUSES = [
  'Order Placed',
  'Payment Confirmed',
  'Processing',
  'Handmade',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
  // Backward compatibility aliases
  'Inquiry',
  'Confirmed',
];

export const TIMELINE_STAGES = [
  'Order Placed',
  'Payment Confirmed',
  'Processing',
  'Handmade',
  'Packed',
  'Shipped',
  'Delivered',
];

export const VALID_STATUS_TRANSITIONS = {
  'Order Placed': ['Payment Confirmed', 'Processing', 'Confirmed', 'Cancelled'],
  'Payment Confirmed': ['Processing', 'Handmade', 'Cancelled'],
  'Processing': ['Handmade', 'Packed', 'Cancelled'],
  'Handmade': ['Packed', 'Shipped', 'Cancelled'],
  'Packed': ['Shipped', 'Delivered', 'Cancelled'],
  'Shipped': ['Delivered', 'Cancelled'],
  'Delivered': [], // Terminal state
  'Cancelled': [], // Terminal state
  // Backward compatibility aliases
  'Inquiry': ['Order Placed', 'Payment Confirmed', 'Confirmed', 'Processing', 'Cancelled'],
  'Confirmed': ['Payment Confirmed', 'Processing', 'Handmade', 'Cancelled'],
};

export const ORDER_CONFIRMATION_METHODS = [
  'WhatsApp',
  'Phone',
  'Direct Communication',
  'Pending Confirmation',
];

export const CRAFT_CATEGORIES = [
  'scarves',
  'gloves',
  'beanies',
  'mufflers',
  'socks',
  'other',
  'accessories',
];

export const CRAFT_TECHNIQUES = [
  'Hand-Knitted',
  'Crocheted',
  'Knitted & Crocheted',
];

export const BUSINESS_CONFIG = {
  businessName: "Gurjeet's Handcraft",
  artisanName: 'Gurjeet',
  phone: process.env.BUSINESS_PHONE || '7018183172',
  whatsappNumber: process.env.BUSINESS_WHATSAPP || '917018183172',
  whatsappBaseUrl: 'https://wa.me/917018183172',
};
