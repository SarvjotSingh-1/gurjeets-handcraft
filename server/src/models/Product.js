import mongoose from 'mongoose';
import { CRAFT_CATEGORIES, CRAFT_TECHNIQUES } from '../config/constants.js';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    category: {
      type: String,
      enum: CRAFT_CATEGORIES,
      required: [true, 'Category is required'],
    },
    craftTechnique: {
      type: String,
      enum: CRAFT_TECHNIQUES,
      required: [true, 'Craft technique is required'],
    },
    material: {
      type: String,
      required: [true, 'Material description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
        alt: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    stock: {
      type: Number,
      default: 1,
      min: [0, 'Stock cannot be negative'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isMadeToOrder: {
      type: Boolean,
      default: false,
    },
    craftingLeadDays: {
      type: Number,
      default: 3,
    },
    dimensions: {
      type: String,
      default: '',
    },
    careInstructions: {
      type: [String],
      default: [
        'Gently hand wash in cool water with mild wool detergent',
        'Lay flat on a dry towel to air dry',
        'Do not machine wash, tumble dry, or bleach',
      ],
    },
    availableColors: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model('Product', productSchema);
export default Product;
