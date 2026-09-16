import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowLeft,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  LogIn,
  Check,
} from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { BUSINESS_CONFIG } from '../../config/business';
import Container from '../../components/common/Container';
import Button from '../../components/common/Button';
import DirectContactButton from '../../components/common/DirectContactButton';
import ArtisanImage from '../../components/common/ArtisanImage';
import EmptyState from '../../components/common/EmptyState';
import SEO from '../../components/common/SEO';

export const WishlistPage = () => {
  const {
    wishlistItems,
    removeFromWishlist,
    clearWishlist,
    isProductAvailable,
    moveToCart,
    loading,
  } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const handleMoveToCart = (product) => {
    moveToCart(addToCart, product, 1);
  };

  const handleMoveAllAvailableToCart = () => {
    const availableItems = wishlistItems.filter(isProductAvailable);
    if (availableItems.length === 0) {
      addToast('None of your saved creations are currently available to add to cart.', 'info');
      return;
    }

    let movedCount = 0;
    availableItems.forEach((product) => {
      const res = moveToCart(addToCart, product, 1);
      if (res.success) movedCount++;
    });

    if (movedCount > 0) {
      addToast(`Moved ${movedCount} ${movedCount === 1 ? 'creation' : 'creations'} to your cart!`, 'success');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all items from your wishlist?')) {
      clearWishlist();
      addToast('Wishlist cleared', 'info');
    }
  };

  const hasAvailableItems = wishlistItems.some(isProductAvailable);

  return (
    <Container className="py-6 sm:py-10 space-y-8">
      <SEO title="My Saved Artisan Pieces | Gurjeet's Handcraft" noindex={true} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-artisan-heather/80 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-artisan-softBrown uppercase tracking-widest font-semibold mb-2">
            <Heart className="w-3.5 h-3.5 text-artisan-terracotta fill-artisan-terracotta" />
            <span>Saved Handcrafted Creations</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown tracking-tight">
            My Artisan Wishlist
          </h1>
          <p className="text-sm text-artisan-softBrown mt-1">
            Personal favorites handcrafted by Gurjeet. Inquire anytime for custom yarn tones or made-to-order requests.
          </p>
        </div>

        {wishlistItems.length > 0 && (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-artisan-sandstone text-artisan-earthBrown">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'creation' : 'creations'} saved
            </span>
            {hasAvailableItems && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMoveAllAvailableToCart}
                className="hidden md:inline-flex text-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                Move All Available to Cart
              </Button>
            )}
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-artisan-softBrown hover:text-rose-600 transition underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Guest Sync Banner (For Logged-Out Visitors) */}
      {!isAuthenticated && wishlistItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-artisan-cream border border-artisan-heather flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2.5 text-artisan-earthBrown">
            <Sparkles className="w-4 h-4 text-artisan-terracotta flex-shrink-0" />
            <span>
              Your favorites are currently saved in this browser. <strong>Sign in</strong> to sync your wishlist across all devices.
            </span>
          </div>
          <Link to="/login" className="flex-shrink-0">
            <Button variant="outline" size="sm" className="whitespace-nowrap text-xs">
              <LogIn className="w-3.5 h-3.5 mr-1.5" /> Sign In to Sync
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-3xl bg-artisan-cream/60 border border-artisan-heather/60" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && wishlistItems.length === 0 && (
        <EmptyState
          icon={Heart}
          title="Your artisan wishlist is empty"
          description="Explore Gurjeet's collection of hand-knitted beanies, scarves, mufflers, and gloves to save your favorite pieces."
          actionText="Browse Handcrafted Creations"
          actionLink="/shop"
        />
      )}

      {/* Populated Wishlist Grid */}
      {!loading && wishlistItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <AnimatePresence>
            {wishlistItems.map((product) => {
              const isAvailable = isProductAvailable(product);
              const isMadeToOrder = Boolean(product.isMadeToOrder);
              const isOutOfStock = !isAvailable && !isMadeToOrder;

              const productWhatsAppUrl = BUSINESS_CONFIG.getProductInquiryUrl({
                productName: product.title,
                price: product.price,
                selectedColor: product.availableColors?.[0] || 'Natural Wool',
              });

              return (
                <motion.article
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="flex flex-col justify-between rounded-3xl bg-artisan-cream border border-artisan-heather p-5 shadow-card relative overflow-hidden group hover:shadow-cozy transition-shadow"
                >
                  <div className="space-y-4">
                    {/* Image Showcase */}
                    <Link
                      to={`/product/${product.slug || product._id}`}
                      className="block overflow-hidden rounded-2xl group/img relative"
                    >
                      <ArtisanImage
                        src={product.images?.[0]?.url}
                        alt={product.title}
                        aspectRatio="aspect-[4/3]"
                        craftTechnique={product.craftTechnique}
                        title={product.title}
                        imageClassName="group-hover/img:scale-105 transition-transform duration-500 ease-artisan"
                      />

                      {/* Availability Overlay Badge */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                        {isAvailable && !isMadeToOrder && (
                          <span className="text-[10px] font-semibold tracking-wider uppercase text-artisan-sage bg-artisan-ivory/95 px-2.5 py-0.5 rounded-full border border-artisan-sage/30 shadow-xs flex items-center gap-1">
                            <Check className="w-2.5 h-2.5 text-artisan-sage" /> In Studio
                          </span>
                        )}
                        {isMadeToOrder && (
                          <span className="text-[10px] font-semibold tracking-wider uppercase text-artisan-amber bg-artisan-ivory/95 px-2.5 py-0.5 rounded-full border border-artisan-amber/30 shadow-xs flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-artisan-amber" /> Made to Order
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="text-[10px] font-semibold tracking-wider uppercase text-artisan-terracotta bg-artisan-ivory/95 px-2.5 py-0.5 rounded-full border border-artisan-terracotta/30 shadow-xs flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5 text-artisan-terracotta" /> Out of Stock
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="space-y-1">
                      <Link
                        to={`/product/${product.slug || product._id}`}
                        className="block font-serif text-lg font-bold text-artisan-earthBrown hover:text-artisan-terracotta transition line-clamp-1"
                      >
                        {product.title}
                      </Link>
                      <p className="text-xs text-artisan-softBrown line-clamp-1">
                        {product.craftTechnique} &bull; {product.material}
                      </p>
                      <div className="flex items-baseline justify-between pt-1">
                        <p className="font-serif text-lg font-bold text-artisan-terracotta">
                          ₹{product.price?.toLocaleString('en-IN')}
                        </p>
                        <span className="text-[11px] text-artisan-softBrown">
                          {product.availableColors?.[0] || 'Handmade Wool'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & WhatsApp Inquiry */}
                  <div className="pt-5 space-y-2.5 border-t border-artisan-heather/60 mt-4">
                    {/* Move to Cart CTA */}
                    {isAvailable ? (
                      <Button
                        size="sm"
                        className="w-full justify-center gap-2"
                        onClick={() => handleMoveToCart(product)}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Move to Cart</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="w-full justify-center gap-2 opacity-60 cursor-not-allowed text-xs"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Currently Unavailable</span>
                      </Button>
                    )}

                    {/* Secondary WhatsApp & Remove Row */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <DirectContactButton
                        action={isAvailable ? 'ask_product' : 'ask_availability'}
                        product={product}
                        label={isAvailable ? 'Ask About This Product' : 'Ask About Availability'}
                        variant="subtle"
                        size="sm"
                      />

                      <button
                        type="button"
                        onClick={() => removeFromWishlist(product._id)}
                        className="p-1.5 rounded-lg text-artisan-softBrown hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Remove from wishlist"
                        aria-label={`Remove ${product.title} from wishlist`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Back to Shop Navigation */}
      <div className="pt-4 border-t border-artisan-heather/40 flex items-center justify-between">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs font-semibold text-artisan-earthBrown hover:text-artisan-terracotta transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Exploring Handmade Creations</span>
        </Link>
      </div>
    </Container>
  );
};

export default WishlistPage;
