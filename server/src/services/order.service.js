import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { ORDER_STATUSES, VALID_STATUS_TRANSITIONS, BUSINESS_CONFIG } from '../config/constants.js';
import { getProductByIdOrSlug } from './product.service.js';

let memoryOrders = [];

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Generate unique artisan order request number (e.g. GH-ORD-123456-789)
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `GH-ORD-${timestamp}-${randomSuffix}`;
};

/**
 * Build pre-filled WhatsApp continuation URL
 */
export const buildOrderWhatsAppUrl = (order) => {
  let waText = `Hello Gurjeet's Handcraft,\nI have submitted an order request on your website:\n\n`;
  waText += `*Order Request Number:* ${order.orderNumber}\n`;
  waText += `*Customer Name:* ${order.customerInfo.name}\n`;
  waText += `*Phone:* ${order.customerInfo.phone}\n\n`;
  waText += `*Requested Products:*\n`;

  order.items.forEach((it, idx) => {
    const col = it.selectedColor ? ` (${it.selectedColor})` : '';
    waText += `${idx + 1}. ${it.title}${col} — Quantity: ${it.quantity} (₹${(
      it.unitPrice * it.quantity
    ).toLocaleString('en-IN')})\n`;
  });

  waText += `\n*Estimated Total:* ₹${order.totalAmount.toLocaleString('en-IN')}\n\n`;
  waText += `*Request:* Please check availability, final price, and delivery details. Looking forward to your confirmation!`;

  return `${BUSINESS_CONFIG.whatsappBaseUrl}?text=${encodeURIComponent(waText)}`;
};

/**
 * Create Order Request
 */
export const createOrder = async (orderData) => {
  const { customerInfo, shippingAddress, items, notes } = orderData;

  // 1. Validate Customer Information
  const name = customerInfo?.name?.trim();
  if (!name || name.length < 2) {
    throw new ApiError(400, 'Full name is required (at least 2 characters)');
  }

  const cleanPhone = (customerInfo?.phone || '').trim().replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length < 10) {
    throw new ApiError(400, 'Valid 10-digit phone number is required');
  }

  const email = (customerInfo?.email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new ApiError(400, 'Valid email address is required');
  }

  // 2. Validate Delivery Address
  const street = shippingAddress?.street?.trim();
  if (!street || street.length < 5) {
    throw new ApiError(400, 'Delivery address is required (minimum 5 characters)');
  }

  const city = shippingAddress?.city?.trim();
  if (!city || city.length < 2) {
    throw new ApiError(400, 'City is required');
  }

  const state = shippingAddress?.state?.trim();
  if (!state || state.length < 2) {
    throw new ApiError(400, 'State is required');
  }

  const postalCode = (shippingAddress?.postalCode || '').trim().replace(/\s/g, '');
  const pinRegex = /^\d{6}$/;
  if (!postalCode || !pinRegex.test(postalCode)) {
    throw new ApiError(400, 'Valid 6-digit PIN code is required');
  }

  const country = shippingAddress?.country?.trim() || 'India';

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Order request must contain at least one item');
  }

  // Validate items and calculate accurate subtotal
  const validatedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const productId = item.productId || item.product?._id || item.product;
    const requestedQty = parseInt(item.quantity, 10);

    if (!productId) {
      throw new ApiError(400, 'Product identifier is required for all items');
    }

    if (!requestedQty || requestedQty < 1) {
      throw new ApiError(400, 'Quantity must be at least 1');
    }

    const product = await getProductByIdOrSlug(productId);

    if (!product.isAvailable) {
      throw new ApiError(400, `Item "${product.title}" is currently marked unavailable`);
    }

    const availableStock = product.stock !== undefined ? product.stock : 0;
    if (requestedQty > availableStock) {
      throw new ApiError(
        400,
        `Requested quantity (${requestedQty}) exceeds available stock (${availableStock}) for "${product.title}"`
      );
    }

    const itemPrice = Number(product.price);
    subtotal += itemPrice * requestedQty;

    validatedItems.push({
      product: product._id,
      title: product.title,
      quantity: requestedQty,
      unitPrice: itemPrice,
      selectedColor: item.selectedColor || '',
      craftNote: item.craftNote || '',
    });
  }

  const shippingFee = subtotal >= 1499 ? 0 : 99;
  const totalAmount = subtotal + shippingFee;
  const orderNumber = generateOrderNumber();

  const payload = {
    orderNumber,
    customerInfo: {
      name,
      phone: cleanPhone,
      email,
    },
    shippingAddress: {
      street,
      city,
      state,
      postalCode,
      country,
    },
    items: validatedItems,
    subtotal,
    shippingFee,
    totalAmount,
    notes: notes ? notes.trim() : '',
    orderStatus: 'Order Placed',
    paymentStatus: 'Pending',
    orderConfirmationMethod: 'Pending Confirmation',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let savedOrder;

  if (isDbConnected()) {
    try {
      savedOrder = await Order.create(payload);
    } catch (err) {
      console.warn('MongoDB order create failed, using memory fallback:', err.message);
      savedOrder = { _id: `mem_ord_${Date.now()}`, ...payload };
      memoryOrders.unshift(savedOrder);
    }
  } else {
    savedOrder = { _id: `mem_ord_${Date.now()}`, ...payload };
    memoryOrders.unshift(savedOrder);
  }

  const whatsappUrl = buildOrderWhatsAppUrl(savedOrder);

  return {
    order: savedOrder,
    whatsappUrl,
    whatsappNumber: BUSINESS_CONFIG.whatsappNumber,
    confirmationNote:
      'Your order request has been received. Gurjeet will contact you to confirm availability, final details and delivery.',
  };
};

/**
 * Get all Orders (Admin)
 */
export const getAllOrders = async (query = {}) => {
  const { status, search } = query;
  const filter = {};

  if (status && ORDER_STATUSES.includes(status)) {
    filter.orderStatus = status;
  }

  if (isDbConnected()) {
    try {
      const orders = await Order.find(filter).sort({ createdAt: -1 });
      return orders;
    } catch (err) {
      console.warn('MongoDB orders find failed, using memory store:', err.message);
    }
  }

  let list = [...memoryOrders];
  if (status) {
    list = list.filter((o) => o.orderStatus === status);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerInfo.name.toLowerCase().includes(q) ||
        o.customerInfo.phone.includes(q)
    );
  }
  return list;
};

/**
 * Get Order by ID or Order Number
 */
export const getOrderByIdOrNumber = async (identifier) => {
  const upper = identifier.toUpperCase();

  if (isDbConnected()) {
    try {
      let order = null;
      if (mongoose.Types.ObjectId.isValid(identifier)) {
        order = await Order.findById(identifier);
      }
      if (!order) {
        order = await Order.findOne({ orderNumber: upper });
      }
      if (order) return order;
    } catch (err) {}
  }

  const memOrder = memoryOrders.find(
    (o) => String(o._id) === String(identifier) || o.orderNumber === upper
  );

  if (!memOrder) {
    throw new ApiError(404, `Order request not found: ${identifier}`);
  }

  return memOrder;
};

/**
 * Get Orders for Customer by Email
 * GET /api/orders/my-orders
 */
export const getCustomerOrders = async (email) => {
  if (!email) {
    throw new ApiError(400, 'Customer email is required to fetch orders');
  }
  const cleanEmail = email.trim().toLowerCase();

  if (isDbConnected()) {
    try {
      const orders = await Order.find({
        'customerInfo.email': cleanEmail,
      }).sort({ createdAt: -1 });
      return orders;
    } catch (err) {
      console.warn('MongoDB getCustomerOrders failed, using memory store:', err.message);
    }
  }

  return memoryOrders
    .filter((o) => (o.customerInfo?.email || '').toLowerCase() === cleanEmail)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Update Order Status (Admin)
 * PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (
  identifier,
  { status, paymentStatus: customPaymentStatus, artisanNotes, orderConfirmationMethod }
) => {
  if (!status || !ORDER_STATUSES.includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}`);
  }

  // 1. Fetch current order to validate transition
  const currentOrder = await getOrderByIdOrNumber(identifier);
  const currentStatus = currentOrder.orderStatus;

  // 2. Validate Status Transition if changing status
  if (status !== currentStatus) {
    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedTransitions.includes(status)) {
      const message =
        allowedTransitions.length > 0
          ? `Cannot transition order status from "${currentStatus}" to "${status}". Allowed next statuses: ${allowedTransitions.join(', ')}`
          : `Cannot transition order status from "${currentStatus}". It is a terminal state.`;
      throw new ApiError(400, message);
    }
  }

  // 3. Synchronize Payment Status
  let paymentStatus = customPaymentStatus || currentOrder.paymentStatus || 'Pending';
  const autoCompletedStatuses = [
    'Payment Confirmed',
    'Processing',
    'Handmade',
    'Packed',
    'Shipped',
    'Delivered',
  ];

  if (!customPaymentStatus) {
    if (autoCompletedStatuses.includes(status) && paymentStatus === 'Pending') {
      paymentStatus = 'Completed';
    } else if (status === 'Cancelled' && paymentStatus === 'Pending') {
      paymentStatus = 'Cancelled';
    }
  }

  const update = {
    orderStatus: status,
    paymentStatus,
    updatedAt: new Date(),
  };

  if (artisanNotes !== undefined) update.artisanNotes = artisanNotes;
  if (orderConfirmationMethod !== undefined) update.orderConfirmationMethod = orderConfirmationMethod;

  const orderMongoId = currentOrder._id;

  if (isDbConnected() && orderMongoId && mongoose.Types.ObjectId.isValid(orderMongoId)) {
    try {
      const updated = await Order.findByIdAndUpdate(orderMongoId, update, { new: true });
      if (updated) return updated;
    } catch (err) {
      console.warn('MongoDB findByIdAndUpdate error:', err.message);
    }
  }

  const idx = memoryOrders.findIndex(
    (o) => String(o._id) === String(identifier) || o.orderNumber === identifier.toUpperCase()
  );

  if (idx !== -1) {
    memoryOrders[idx] = { ...memoryOrders[idx], ...update };
    return memoryOrders[idx];
  }

  return { ...currentOrder, ...update };
};
