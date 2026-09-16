import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Trash2,
  Sparkles,
  Lock,
  RefreshCw,
} from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import reviewService from '../../api/reviewService';

const STAR_DESCRIPTIONS = {
  1: 'Needs Improvement (1/5)',
  2: 'Fair Quality (2/5)',
  3: 'Good & Warm (3/5)',
  4: 'Wonderful Craftsmanship (4/5)',
  5: 'Exceptional Masterpiece (5/5)',
};

export const ProductReviews = ({ productId, productTitle = 'Handmade Piece' }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    ratingCount: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    distributionPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review submission state
  const [eligibility, setEligibility] = useState({
    isEligible: false,
    isVerifiedBuyer: false,
    hasReviewed: false,
    reason: '',
  });
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch reviews & stats
  const loadReviewsAndStats = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await reviewService.getProductReviews(productId);
      setReviews(data.reviews || []);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setError(err.message || 'Unable to load reviews for this creation.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Fetch customer eligibility
  const checkEligibility = useCallback(async () => {
    if (!productId) return;
    try {
      const elig = await reviewService.getEligibility(productId);
      setEligibility(elig);
    } catch (err) {
      console.warn('Review eligibility check failed:', err.message);
    }
  }, [productId]);

  useEffect(() => {
    loadReviewsAndStats();
    checkEligibility();
  }, [loadReviewsAndStats, checkEligibility, user]);

  // Handle Review Submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setSubmitError('Please select a star rating from 1 to 5');
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      setSubmitError('Review comment must be at least 5 characters long');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      await reviewService.submitReview(productId, {
        rating,
        comment: comment.trim(),
        userName: user?.name,
      });

      setSubmitSuccess(true);
      setComment('');
      addToast('Thank you! Your verified review has been published.', 'success');

      // Refresh reviews list & eligibility
      await loadReviewsAndStats();
      await checkEligibility();
    } catch (err) {
      console.error('Review submission failed:', err);
      setSubmitError(err.message || 'Failed to submit review. Please try again.');
      addToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Admin Review Deletion
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Admin action: Are you sure you want to permanently delete this review?')) {
      return;
    }

    try {
      setDeletingId(reviewId);
      await reviewService.deleteReview(reviewId);
      addToast('Review deleted successfully', 'info');
      await loadReviewsAndStats();
    } catch (err) {
      console.error('Failed to delete review:', err);
      addToast(err.message || 'Failed to delete review', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const activeRatingDesc = hoverRating > 0 ? STAR_DESCRIPTIONS[hoverRating] : STAR_DESCRIPTIONS[rating];

  return (
    <section id="reviews-section" className="space-y-8 pt-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-artisan-heather/80 pb-4 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-artisan-terracotta font-semibold">
            Artisan Stories & Feedback
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-artisan-earthBrown">
            Customer Reviews & Ratings
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="terracotta" className="text-xs">
            Strictly Verified Purchases
          </Badge>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6 animate-pulse">
          <div className="h-44 bg-artisan-ivory/60 rounded-3xl border border-artisan-heather/60" />
          <div className="h-32 bg-artisan-ivory/60 rounded-3xl border border-artisan-heather/60" />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-8 rounded-3xl bg-artisan-cream border border-artisan-heather text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-artisan-terracotta mx-auto" />
          <p className="text-sm text-artisan-earthBrown font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={loadReviewsAndStats}>
            <RefreshCw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* =========================================================================
              RATING OVERVIEW & DISTRIBUTION CARD
              ========================================================================= */}
          <div className="p-6 sm:p-8 rounded-3xl bg-artisan-cream border border-artisan-heather grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left: Overall Score */}
            <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-artisan-heather/80 pb-6 md:pb-0 md:pr-8">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-5xl font-extrabold text-artisan-earthBrown">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
                </span>
                <span className="text-artisan-softBrown text-sm font-medium">/ 5.0</span>
              </div>

              {/* Star icons */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(stats.averageRating)
                        ? 'text-artisan-amber fill-artisan-amber'
                        : 'text-artisan-woolHeather fill-artisan-cream'
                    }`}
                  />
                ))}
              </div>

              <p className="text-xs text-artisan-softBrown">
                {stats.ratingCount === 0
                  ? 'No ratings yet'
                  : `Based on ${stats.ratingCount} verified ${
                      stats.ratingCount === 1 ? 'customer review' : 'customer reviews'
                    }`}
              </p>

              <div className="inline-flex items-center gap-1.5 text-[11px] text-artisan-sage font-medium pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-artisan-sage" />
                <span>100% Genuine Handcrafted Feedback</span>
              </div>
            </div>

            {/* Right: 5-to-1 Star Distribution Progress Bars */}
            <div className="md:col-span-7 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution?.[star] || 0;
                const percentage = stats.distributionPercentages?.[star] || 0;

                return (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <span className="w-12 text-artisan-softBrown font-medium flex items-center gap-1">
                      {star} <Star className="w-3 h-3 text-artisan-amber fill-artisan-amber" />
                    </span>

                    {/* Bar container */}
                    <div className="flex-1 h-2.5 bg-artisan-ivory rounded-full overflow-hidden border border-artisan-heather/60">
                      <div
                        className="h-full bg-artisan-amber transition-all duration-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <span className="w-16 text-right text-artisan-softBrown font-mono text-[11px]">
                      {count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =========================================================================
              REVIEW SUBMISSION SECTION (Strict Verified Buyer / Duplicate Check)
              ========================================================================= */}
          <div className="p-6 sm:p-8 rounded-3xl bg-artisan-ivory border border-artisan-heather space-y-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-artisan-terracotta" />
              <h3 className="font-serif text-xl font-bold text-artisan-earthBrown">
                Share Your Verified Handcraft Story
              </h3>
            </div>

            {/* State A: Guest (Not Signed In) */}
            {!isAuthenticated && (
              <div className="p-5 rounded-2xl bg-artisan-cream border border-artisan-heather flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-artisan-earthBrown flex items-center gap-2">
                    <Lock className="w-4 h-4 text-artisan-softBrown" />
                    Sign in to leave a review
                  </p>
                  <p className="text-artisan-softBrown">
                    Only verified customers who purchased this piece can submit reviews to preserve genuine artisan feedback.
                  </p>
                </div>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="whitespace-nowrap">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}

            {/* State B: Signed in, but has already reviewed this piece */}
            {isAuthenticated && eligibility.hasReviewed && (
              <div className="p-5 rounded-2xl bg-artisan-sageLight/50 border border-artisan-sage/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-artisan-sage flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-artisan-earthBrown">
                    Thank you for your review!
                  </p>
                  <p className="text-artisan-softBrown">
                    You have already submitted your verified review for this handmade creation. Your feedback means the world to our studio.
                  </p>
                </div>
              </div>
            )}

            {/* State C: Signed in, but has NOT purchased this piece */}
            {isAuthenticated && !eligibility.isEligible && !eligibility.hasReviewed && (
              <div className="p-5 rounded-2xl bg-artisan-cream border border-artisan-heather flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-artisan-terracotta flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-artisan-earthBrown">
                    Verified Purchase Required
                  </p>
                  <p className="text-artisan-softBrown leading-relaxed">
                    Reviews on Gurjeet's Handcraft are reserved for verified customers who have genuinely purchased this item. If you have commissioned or ordered this piece with another email, please ensure you are signed in with that account.
                  </p>
                </div>
              </div>
            )}

            {/* State D: Eligible Verified Customer (Submission Form) */}
            {isAuthenticated && eligibility.isEligible && !eligibility.hasReviewed && (
              <form onSubmit={handleSubmitReview} className="space-y-5">
                <div className="p-4 rounded-2xl bg-artisan-sageLight/40 border border-artisan-sage/30 flex items-center gap-2 text-xs text-artisan-sage font-medium">
                  <CheckCircle2 className="w-4 h-4 text-artisan-sage flex-shrink-0" />
                  <span>
                    Verified Customer: You purchased this piece. Gurjeet warmly welcomes your honest feedback.
                  </span>
                </div>

                {/* Rating Stars Picker */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-widest font-semibold text-artisan-softBrown">
                    Select Your Rating *
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= (hoverRating || rating);
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 text-artisan-woolHeather hover:scale-110 transition-transform focus:outline-none"
                            aria-label={`Rate ${star} star`}
                          >
                            <Star
                              className={`w-7 h-7 transition-colors ${
                                isFilled
                                  ? 'text-artisan-amber fill-artisan-amber'
                                  : 'text-artisan-woolHeather fill-none'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-semibold text-artisan-earthBrown">
                      {activeRatingDesc}
                    </span>
                  </div>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="review-comment"
                      className="block text-xs uppercase tracking-widest font-semibold text-artisan-softBrown"
                    >
                      Your Handcrafted Experience *
                    </label>
                    <span className="text-[11px] text-artisan-softBrown font-mono">
                      {comment.length} / 1000
                    </span>
                  </div>

                  <textarea
                    id="review-comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe the wool warmth, knit tension, natural dye richness, and how the piece feels..."
                    maxLength={1000}
                    className="w-full px-4 py-3 rounded-2xl bg-artisan-ivory border border-artisan-heather text-sm text-artisan-earthBrown focus:ring-2 focus:ring-artisan-terracotta focus:border-transparent outline-none transition placeholder:text-artisan-softBrown/50 resize-y min-h-[100px]"
                    required
                  />
                  <p className="text-[11px] text-artisan-softBrown">
                    Minimum 5 characters. Please keep reviews respectful and focused on the handmade creation.
                  </p>
                </div>

                {/* Error Banner */}
                {submitError && (
                  <div className="p-3.5 rounded-xl bg-artisan-terracottaLight border border-artisan-terracotta/30 text-xs text-artisan-terracotta flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={submitting || comment.trim().length < 5}
                  >
                    {submitting ? 'Submitting Review...' : 'Publish Verified Review'}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* =========================================================================
              REVIEWS LIST
              ========================================================================= */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-artisan-earthBrown">
              Verified Customer Stories ({reviews.length})
            </h3>

            {/* Empty State: Zero Reviews */}
            {reviews.length === 0 ? (
              <div className="p-10 rounded-3xl bg-artisan-cream/60 border border-artisan-heather/80 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-artisan-ivory border border-artisan-heather flex items-center justify-center mx-auto text-artisan-terracotta">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-lg font-bold text-artisan-earthBrown">
                  No reviews yet for this piece
                </h4>
                <p className="text-xs text-artisan-softBrown max-w-md mx-auto leading-relaxed">
                  Every creation is made individually with Himachal wool. Be the first verified customer to share your experience with this {productTitle.toLowerCase()}.
                </p>
              </div>
            ) : (
              /* Populated Reviews List */
              <div className="space-y-4">
                {reviews.map((rev) => {
                  const reviewerName = rev.userName || rev.user?.name || 'Verified Customer';
                  const initials = reviewerName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'VC';
                  const formattedDate = rev.createdAt
                    ? new Date(rev.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recently';

                  return (
                    <motion.div
                      key={rev._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-3 transition-shadow hover:shadow-subtle"
                    >
                      {/* Review Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-artisan-terracottaLight border border-artisan-terracotta/30 flex items-center justify-center font-serif font-bold text-artisan-terracotta text-xs">
                            {initials}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-artisan-earthBrown text-sm">
                                {reviewerName}
                              </h4>
                              {rev.isVerifiedPurchase !== false && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-artisan-sage bg-artisan-sageLight px-2 py-0.5 rounded-full border border-artisan-sage/20">
                                  <ShieldCheck className="w-3 h-3 text-artisan-sage" />
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-artisan-softBrown">
                              Reviewed on {formattedDate}
                            </span>
                          </div>
                        </div>

                        {/* Admin Inline Moderation / Deletion */}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev._id)}
                            disabled={deletingId === rev._id}
                            className="p-1.5 rounded-lg text-artisan-softBrown hover:text-red-600 hover:bg-red-50 transition text-xs flex items-center gap-1"
                            title="Admin: Delete inappropriate review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[11px]">Remove</span>
                          </button>
                        )}
                      </div>

                      {/* Star Rating */}
                      <div className="flex items-center gap-1 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(rev.rating)
                                ? 'text-artisan-amber fill-artisan-amber'
                                : 'text-artisan-woolHeather fill-artisan-ivory'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-medium text-artisan-softBrown ml-2">
                          {rev.rating} / 5
                        </span>
                      </div>

                      {/* Comment */}
                      <p className="text-xs sm:text-sm text-artisan-earthBrown/90 leading-relaxed whitespace-pre-line pt-1">
                        {rev.comment}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default ProductReviews;
