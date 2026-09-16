import mongoose from 'mongoose';

export const CUSTOM_ORDER_STATUSES = [
  'Pending',
  'Under Review',
  'Accepted',
  'Rejected',
  'Completed',
];

const customOrderSchema = new mongoose.Schema(
  {
    customOrderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required for WhatsApp communication'],
      trim: true,
    },
    productType: {
      type: String,
      required: [true, 'Product type is required'],
      trim: true,
    },
    colorPreference: {
      type: String,
      required: [true, 'Color preference is required'],
      trim: true,
    },
    size: {
      type: String,
      required: [true, 'Size or dimensions are required'],
      trim: true,
    },
    designPattern: {
      type: String,
      required: [true, 'Design or pattern details are required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    requiredDate: {
      type: String,
      default: '',
      trim: true,
    },
    additionalNotes: {
      type: String,
      default: '',
      trim: true,
    },
    referenceImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: CUSTOM_ORDER_STATUSES,
      default: 'Pending',
    },
    estimatedPrice: {
      type: Number,
      default: 0,
    },
    adminNotes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CustomOrder = mongoose.model('CustomOrder', customOrderSchema);
export default CustomOrder;
