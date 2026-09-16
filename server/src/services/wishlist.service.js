import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { getProductByIdOrSlug } from './product.service.js';

let memoryWishlists = {}; // userId -> array of productIds

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Get User Wishlist
 * Automatically purges any deleted products so customer never sees corrupt/broken entries
 */
export const getWishlist = async (userId) => {
  if (!userId) throw new ApiError(401, 'Authentication required');

  // 1. MongoDB Store
  if (isDbConnected() && mongoose.Types.ObjectId.isValid(userId)) {
    try {
      const user = await User.findById(userId).populate('wishlist');
      if (user) {
        // Filter out null/undefined entries (occurs when a referenced product has been deleted)
        const validItems = (user.wishlist || []).filter((item) => item && item._id);

        // Self-heal: clean up database references if any deleted items were discovered
        if (validItems.length !== (user.wishlist || []).length) {
          user.wishlist = validItems.map((p) => p._id);
          await user.save();
        }

        return validItems;
      }
    } catch (err) {
      console.warn('MongoDB getWishlist error, using memory store fallback:', err.message);
    }
  }

  // 2. In-Memory Store
  const uId = String(userId);
  const productIds = memoryWishlists[uId] || [];
  const populated = [];
  const validIds = [];

  for (const pid of productIds) {
    try {
      const prod = await getProductByIdOrSlug(pid);
      if (prod && prod._id) {
        populated.push(prod);
        validIds.push(String(prod._id));
      }
    } catch (err) {
      // Product was deleted from catalog or does not exist; omit from wishlist
    }
  }

  // Self-heal memory store
  memoryWishlists[uId] = validIds;

  return populated;
};

/**
 * Add Product to Wishlist
 * Idempotent: strictly prevents duplicate additions
 */
export const addToWishlist = async (userId, productId) => {
  if (!userId) throw new ApiError(401, 'Authentication required');
  if (!productId) throw new ApiError(400, 'Product ID is required');

  // Verify product exists (throws 404 if deleted or invalid)
  const product = await getProductByIdOrSlug(productId);
  const targetId = String(product._id);

  // 1. MongoDB Store
  if (isDbConnected() && mongoose.Types.ObjectId.isValid(userId)) {
    try {
      const user = await User.findById(userId);
      if (user) {
        const alreadyExists = (user.wishlist || []).some(
          (id) => String(id?._id || id) === targetId
        );

        if (!alreadyExists) {
          user.wishlist.push(product._id);
          await user.save();
        }

        return await getWishlist(userId);
      }
    } catch (err) {
      console.warn('MongoDB addToWishlist error, using memory store fallback:', err.message);
    }
  }

  // 2. Memory Store
  const uId = String(userId);
  if (!memoryWishlists[uId]) {
    memoryWishlists[uId] = [];
  }

  if (!memoryWishlists[uId].includes(targetId)) {
    memoryWishlists[uId].push(targetId);
  }

  return await getWishlist(userId);
};

/**
 * Remove Product from Wishlist
 */
export const removeFromWishlist = async (userId, productId) => {
  if (!userId) throw new ApiError(401, 'Authentication required');
  if (!productId) throw new ApiError(400, 'Product ID is required');

  const targetId = String(productId);

  // 1. MongoDB Store
  if (isDbConnected() && mongoose.Types.ObjectId.isValid(userId)) {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.wishlist = (user.wishlist || []).filter(
          (id) => String(id?._id || id) !== targetId
        );
        await user.save();
        return await getWishlist(userId);
      }
    } catch (err) {
      console.warn('MongoDB removeFromWishlist error, using memory store fallback:', err.message);
    }
  }

  // 2. Memory Store
  const uId = String(userId);
  if (memoryWishlists[uId]) {
    memoryWishlists[uId] = memoryWishlists[uId].filter(
      (id) => String(id) !== targetId
    );
  }

  return await getWishlist(userId);
};
