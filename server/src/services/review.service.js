import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { getProductByIdOrSlug } from './product.service.js';
import { getAllOrders } from './order.service.js';

// Production in-memory store: starts completely empty (zero fake reviews)
let memoryReviews = [];

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Check whether a customer has a genuine, non-cancelled purchase of the product
 */
export const hasCustomerPurchasedProduct = async (userEmail, productId) => {
  if (!userEmail) return false;
  const cleanEmail = userEmail.trim().toLowerCase();
  const targetProdId = String(productId);

  // 1. Check MongoDB orders
  if (isDbConnected()) {
    try {
      const orders = await Order.find({
        'customerInfo.email': cleanEmail,
        orderStatus: { $ne: 'Cancelled' },
      });

      for (const ord of orders) {
        const found = ord.items?.some((it) => {
          const itId = it.product?._id ? String(it.product._id) : String(it.product);
          return itId === targetProdId;
        });
        if (found) return true;
      }
    } catch (err) {
      console.warn('MongoDB purchase verification query error:', err.message);
    }
  }

  // 2. Check memory store orders
  try {
    const memOrders = await getAllOrders();
    for (const ord of memOrders) {
      const orderEmail = (ord.customerInfo?.email || '').trim().toLowerCase();
      if (orderEmail === cleanEmail && ord.orderStatus !== 'Cancelled') {
        const found = ord.items?.some((it) => {
          const itId = it.product?._id ? String(it.product._id) : String(it.product);
          return itId === targetProdId;
        });
        if (found) return true;
      }
    }
  } catch (err) {}

  return false;
};

/**
 * Check if the customer has already submitted a review for this product
 */
export const hasCustomerReviewedProduct = async (user, productId) => {
  const targetProdId = String(productId);
  const userId = user?._id ? String(user._id) : null;
  const userEmail = (user?.email || '').trim().toLowerCase();

  // 1. Check MongoDB reviews
  if (isDbConnected()) {
    try {
      const orConditions = [];
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        orConditions.push({ user: userId });
      }
      if (userEmail) {
        orConditions.push({ userEmail });
      }

      if (orConditions.length > 0) {
        const existing = await Review.findOne({
          product: targetProdId,
          $or: orConditions,
        });
        if (existing) return true;
      }
    } catch (err) {}
  }

  // 2. Check memory reviews
  return memoryReviews.some(
    (r) =>
      String(r.product) === targetProdId &&
      ((userId && String(r.user) === userId) ||
        (userEmail && (r.userEmail || '').toLowerCase() === userEmail))
  );
};

/**
 * Compute rating metrics: average, count, 5-star to 1-star distribution
 */
export const computeReviewStats = (reviews = []) => {
  const ratingCount = reviews.length;
  if (ratingCount === 0) {
    return {
      averageRating: 0,
      ratingCount: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      distributionPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  for (const r of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
    distribution[star] = (distribution[star] || 0) + 1;
    sum += star;
  }

  const averageRating = Number((sum / ratingCount).toFixed(1));
  const distributionPercentages = {
    5: Math.round((distribution[5] / ratingCount) * 100),
    4: Math.round((distribution[4] / ratingCount) * 100),
    3: Math.round((distribution[3] / ratingCount) * 100),
    2: Math.round((distribution[2] / ratingCount) * 100),
    1: Math.round((distribution[1] / ratingCount) * 100),
  };

  return {
    averageRating,
    ratingCount,
    distribution,
    distributionPercentages,
  };
};

/**
 * Check if the user is eligible to write a review
 */
export const checkReviewEligibility = async (productId, user = null) => {
  if (!user) {
    return {
      isEligible: false,
      isVerifiedBuyer: false,
      hasReviewed: false,
      reason: 'Sign in to share your thoughts on this handcrafted creation.',
    };
  }

  const product = await getProductByIdOrSlug(productId);
  const targetId = String(product._id);

  const hasReviewed = await hasCustomerReviewedProduct(user, targetId);
  if (hasReviewed) {
    return {
      isEligible: false,
      isVerifiedBuyer: true,
      hasReviewed: true,
      reason: 'You have already submitted a review for this piece.',
    };
  }

  const isVerifiedBuyer =
    user.role === 'admin' || (await hasCustomerPurchasedProduct(user.email, targetId));

  if (!isVerifiedBuyer) {
    return {
      isEligible: false,
      isVerifiedBuyer: false,
      hasReviewed: false,
      reason: 'Only verified customers who purchased this handmade piece can submit a review.',
    };
  }

  return {
    isEligible: true,
    isVerifiedBuyer: true,
    hasReviewed: false,
    reason: '',
  };
};

/**
 * Get Reviews and Statistics for a Product (Public: Only Approved)
 */
export const getProductReviews = async (productId) => {
  const product = await getProductByIdOrSlug(productId);
  const targetId = String(product._id);

  let reviews = [];

  if (isDbConnected()) {
    try {
      if (mongoose.Types.ObjectId.isValid(targetId)) {
        reviews = await Review.find({
          product: targetId,
          isApproved: { $ne: false },
        }).sort({ createdAt: -1 });
      }
    } catch (err) {
      console.warn('MongoDB getProductReviews failed, using memory store:', err.message);
    }
  }

  if (!reviews || reviews.length === 0) {
    reviews = memoryReviews.filter(
      (r) =>
        (String(r.product) === targetId || String(r.product) === String(productId)) &&
        r.isApproved !== false
    );
  }

  const stats = computeReviewStats(reviews);

  return {
    reviews,
    stats,
  };
};

/**
 * Create a new Product Review (Strict Verified Purchase & Duplicate Prevention)
 */
export const createProductReview = async (
  productId,
  { rating, comment, userName },
  user = null
) => {
  if (!user) {
    throw new ApiError(401, 'Please sign in to submit a review');
  }

  const product = await getProductByIdOrSlug(productId);
  const targetId = String(product._id);

  // 1. Validate star rating (1 to 5 integer)
  const numRating = Number(rating);
  if (!numRating || numRating < 1 || numRating > 5 || !Number.isInteger(numRating)) {
    throw new ApiError(400, 'Rating must be an integer between 1 and 5 stars');
  }

  // 2. Validate comment length
  const cleanComment = (comment || '').trim();
  if (!cleanComment || cleanComment.length < 5) {
    throw new ApiError(400, 'Review comment must be at least 5 characters long');
  }

  if (cleanComment.length > 1000) {
    throw new ApiError(400, 'Review comment cannot exceed 1000 characters');
  }

  // 3. Prevent Inappropriate Duplicate Reviews
  const alreadyReviewed = await hasCustomerReviewedProduct(user, targetId);
  if (alreadyReviewed) {
    throw new ApiError(409, 'You have already submitted a review for this handcrafted piece');
  }

  // 4. Enforce Verified Purchase (Customer must have ordered this product)
  const isPurchased = await hasCustomerPurchasedProduct(user.email, targetId);
  if (!isPurchased && user.role !== 'admin') {
    throw new ApiError(
      403,
      'Only verified customers who purchased this handmade piece can submit a review'
    );
  }

  const reviewerName = user.name || userName?.trim() || 'Verified Customer';

  const payload = {
    product: product._id,
    user: user._id,
    userEmail: (user.email || '').toLowerCase().trim(),
    userName: reviewerName,
    rating: Math.round(numRating),
    comment: cleanComment,
    isVerifiedPurchase: true,
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let createdReview;
  if (isDbConnected() && mongoose.Types.ObjectId.isValid(targetId)) {
    try {
      createdReview = await Review.create(payload);
    } catch (err) {
      console.warn('MongoDB review save failed, using memory store fallback:', err.message);
    }
  }

  if (!createdReview) {
    createdReview = {
      _id: `rev_mem_${Date.now()}`,
      ...payload,
    };
    memoryReviews.unshift(createdReview);
  }

  return createdReview;
};

/**
 * Get All Reviews (Admin only)
 */
export const getAllReviews = async () => {
  if (isDbConnected()) {
    try {
      const reviews = await Review.find()
        .populate('product', 'title slug')
        .sort({ createdAt: -1 });
      return reviews;
    } catch (err) {
      console.warn('MongoDB getAllReviews failed, using memory store:', err.message);
    }
  }

  return memoryReviews.map((r) => {
    return {
      ...r,
      isApproved: r.isApproved !== undefined ? r.isApproved : true,
      productTitle: r.productTitle || r.product?.title || 'Handmade Woolen Piece',
    };
  });
};

/**
 * Moderate Review (Admin only: toggle isApproved)
 */
export const moderateReview = async (reviewId, { isApproved }) => {
  const approvedBool = Boolean(isApproved);

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(reviewId)) {
    try {
      const updated = await Review.findByIdAndUpdate(
        reviewId,
        { isApproved: approvedBool },
        { new: true }
      ).populate('product', 'title slug');
      if (updated) return updated;
    } catch (err) {}
  }

  const idx = memoryReviews.findIndex((r) => String(r._id) === String(reviewId));
  if (idx === -1) {
    throw new ApiError(404, `Review not found with ID: ${reviewId}`);
  }

  memoryReviews[idx] = {
    ...memoryReviews[idx],
    isApproved: approvedBool,
    updatedAt: new Date(),
  };

  return memoryReviews[idx];
};

/**
 * Delete Review (Admin only)
 */
export const deleteReview = async (reviewId) => {
  if (isDbConnected() && mongoose.Types.ObjectId.isValid(reviewId)) {
    try {
      const deleted = await Review.findByIdAndDelete(reviewId);
      if (deleted) return deleted;
    } catch (err) {}
  }

  const idx = memoryReviews.findIndex((r) => String(r._id) === String(reviewId));
  if (idx === -1) {
    throw new ApiError(404, `Review not found with ID: ${reviewId}`);
  }

  const removed = memoryReviews.splice(idx, 1)[0];
  return removed;
};

/**
 * Get Recent Approved Reviews (Public endpoint for Home/Community showcase)
 */
export const getRecentApprovedReviews = async (limit = 6) => {
  const maxLimit = Math.min(Math.max(Number(limit) || 6, 1), 20);

  if (isDbConnected()) {
    try {
      const reviews = await Review.find({ isApproved: true })
        .populate('product', 'title slug images')
        .sort({ createdAt: -1 })
        .limit(maxLimit);

      return reviews.map((r) => ({
        _id: r._id,
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
        isVerifiedPurchase: r.isVerifiedPurchase,
        createdAt: r.createdAt,
        product: r.product
          ? {
              _id: r.product._id,
              title: r.product.title,
              slug: r.product.slug,
              image: r.product.images?.[0]?.url,
            }
          : null,
      }));
    } catch (err) {
      console.warn('MongoDB getRecentApprovedReviews failed, using memory store:', err.message);
    }
  }

  return memoryReviews
    .filter((r) => r.isApproved !== false)
    .slice(0, maxLimit)
    .map((r) => ({
      _id: r._id,
      userName: r.userName || 'Verified Customer',
      rating: r.rating,
      comment: r.comment,
      isVerifiedPurchase: r.isVerifiedPurchase !== false,
      createdAt: r.createdAt,
      product: {
        _id: r.product?._id || r.product,
        title: r.productTitle || r.product?.title || 'Handmade Woolen Piece',
        slug: r.productSlug || r.product?.slug || '',
        image: r.product?.images?.[0]?.url || null,
      },
    }));
};
