import mongoose from 'mongoose';
import { CustomOrder, CUSTOM_ORDER_STATUSES } from '../models/CustomOrder.js';
import { ApiError } from '../utils/ApiError.js';
import { BUSINESS_CONFIG } from '../config/constants.js';

let memoryCustomOrders = [];

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Generate unique custom order number (e.g. GH-CUST-849201)
 */
const generateCustomOrderNumber = () => {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `GH-CUST-${randomSuffix}`;
};

/**
 * Build pre-filled WhatsApp continuation link for custom order
 */
export const buildCustomOrderWhatsAppUrl = (customOrder) => {
  let text = `Hello Gurjeet's Handcraft,\nI have submitted a Custom Order Request on your website:\n\n`;
  text += `*Custom Request ID:* ${customOrder.customOrderNumber}\n`;
  text += `*Name:* ${customOrder.name}\n`;
  text += `*Phone:* ${customOrder.phone}\n`;
  text += `*Product Type:* ${customOrder.productType}\n`;
  text += `*Color Preference:* ${customOrder.colorPreference}\n`;
  text += `*Size:* ${customOrder.size}\n`;
  text += `*Design / Pattern:* ${customOrder.designPattern}\n`;
  text += `*Quantity:* ${customOrder.quantity}\n`;
  if (customOrder.requiredDate) {
    text += `*Required Date:* ${customOrder.requiredDate}\n`;
  }
  if (customOrder.additionalNotes) {
    text += `*Notes:* ${customOrder.additionalNotes}\n`;
  }
  text += `\nPlease review my request and let me know about feasibility, pricing, and crafting timeline. Thank you!`;

  return `${BUSINESS_CONFIG.whatsappBaseUrl}?text=${encodeURIComponent(text)}`;
};

/**
 * Create Custom Order Request
 */
export const createCustomOrder = async (data) => {
  const {
    name,
    email,
    phone,
    productType,
    colorPreference,
    size,
    designPattern,
    quantity = 1,
    requiredDate = '',
    additionalNotes = '',
    referenceImage = '',
  } = data;

  if (!name?.trim()) throw new ApiError(400, 'Customer name is required');
  if (!email?.trim()) throw new ApiError(400, 'Email address is required');
  if (!phone?.trim()) throw new ApiError(400, 'Phone number is required');
  if (!productType?.trim()) throw new ApiError(400, 'Product type is required');
  if (!colorPreference?.trim()) throw new ApiError(400, 'Color preference is required');
  if (!size?.trim()) throw new ApiError(400, 'Size is required');
  if (!designPattern?.trim()) throw new ApiError(400, 'Design pattern details are required');

  const customOrderNumber = generateCustomOrderNumber();

  const payload = {
    customOrderNumber,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    productType: productType.trim(),
    colorPreference: colorPreference.trim(),
    size: size.trim(),
    designPattern: designPattern.trim(),
    quantity: Math.max(1, parseInt(quantity, 10) || 1),
    requiredDate: requiredDate?.trim() || '',
    additionalNotes: additionalNotes?.trim() || '',
    referenceImage: referenceImage || '',
    status: 'Pending',
    adminNotes: '',
    estimatedPrice: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let savedOrder;

  if (isDbConnected()) {
    try {
      savedOrder = await CustomOrder.create(payload);
    } catch (err) {
      console.warn('MongoDB custom order save failed, using memory store:', err.message);
      savedOrder = { _id: `mem_cust_${Date.now()}`, ...payload };
      memoryCustomOrders.unshift(savedOrder);
    }
  } else {
    savedOrder = { _id: `mem_cust_${Date.now()}`, ...payload };
    memoryCustomOrders.unshift(savedOrder);
  }

  const whatsAppContinuationUrl = buildCustomOrderWhatsAppUrl(savedOrder);

  return {
    customOrder: savedOrder,
    whatsAppContinuationUrl,
    confirmationMessage:
      'Your custom order request has been received. Gurjeet will review your request and personally confirm feasibility, price and timeline on WhatsApp or phone.',
  };
};

/**
 * Get all Custom Orders (Admin)
 */
export const getCustomOrders = async (query = {}) => {
  const { status, search } = query;
  const filter = {};

  if (status && CUSTOM_ORDER_STATUSES.includes(status)) {
    filter.status = status;
  }

  if (isDbConnected()) {
    try {
      const orders = await CustomOrder.find(filter).sort({ createdAt: -1 });
      return orders;
    } catch (err) {
      console.warn('MongoDB custom orders find failed, using memory store:', err.message);
    }
  }

  let list = [...memoryCustomOrders];
  if (status) list = list.filter((o) => o.status === status);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (o) =>
        o.customOrderNumber.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q) ||
        o.phone.includes(q)
    );
  }
  return list;
};

/**
 * Get Custom Order by ID or Number
 */
export const getCustomOrderByIdOrNumber = async (identifier) => {
  const upper = identifier.toUpperCase();

  if (isDbConnected()) {
    try {
      let order = null;
      if (mongoose.Types.ObjectId.isValid(identifier)) {
        order = await CustomOrder.findById(identifier);
      }
      if (!order) {
        order = await CustomOrder.findOne({ customOrderNumber: upper });
      }
      if (order) return order;
    } catch (err) {}
  }

  const memOrder = memoryCustomOrders.find(
    (o) => String(o._id) === String(identifier) || o.customOrderNumber === upper
  );

  if (!memOrder) {
    throw new ApiError(404, `Custom order request not found: ${identifier}`);
  }

  return memOrder;
};

/**
 * Update Custom Order (Admin)
 */
export const updateCustomOrder = async (identifier, updateData) => {
  const { status, adminNotes, estimatedPrice } = updateData;

  if (status && !CUSTOM_ORDER_STATUSES.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status. Must be one of: ${CUSTOM_ORDER_STATUSES.join(', ')}`
    );
  }

  const payload = { updatedAt: new Date() };
  if (status) payload.status = status;
  if (adminNotes !== undefined) payload.adminNotes = adminNotes;
  if (estimatedPrice !== undefined) payload.estimatedPrice = estimatedPrice;

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(identifier)) {
    try {
      const updated = await CustomOrder.findByIdAndUpdate(identifier, payload, { new: true });
      if (updated) return updated;
    } catch (err) {}
  }

  const idx = memoryCustomOrders.findIndex(
    (o) => String(o._id) === String(identifier) || o.customOrderNumber === identifier.toUpperCase()
  );

  if (idx === -1) {
    throw new ApiError(404, `Custom order request not found: ${identifier}`);
  }

  memoryCustomOrders[idx] = { ...memoryCustomOrders[idx], ...payload };
  return memoryCustomOrders[idx];
};
