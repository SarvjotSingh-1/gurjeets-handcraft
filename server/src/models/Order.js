import mongoose from 'mongoose';
import { ORDER_STATUSES, ORDER_CONFIRMATION_METHODS } from '../config/constants.js';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative'],
    },
    selectedColor: {
      type: String,
      default: '',
    },
    craftNote: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    customerInfo: {
      name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Customer phone number is required for WhatsApp & manual confirmation'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Customer email is required'],
        trim: true,
        lowercase: true,
      },
    },
    shippingAddress: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
      },
      postalCode: {
        type: String,
        required: [true, 'PIN Code is required'],
        trim: true,
      },
      country: {
        type: String,
        default: 'India',
        trim: true,
      },
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order items are required'],
      validate: [
        (items) => Array.isArray(items) && items.length > 0,
        'Order must contain at least one item',
      ],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    orderStatus: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'Order Placed',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Cancelled'],
      default: 'Pending',
    },
    orderConfirmationMethod: {
      type: String,
      enum: ORDER_CONFIRMATION_METHODS,
      default: 'Pending Confirmation',
    },
    artisanNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model('Order', orderSchema);
export default Order;
