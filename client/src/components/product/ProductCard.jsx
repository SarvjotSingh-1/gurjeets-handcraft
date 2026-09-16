import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Badge from '../common/Badge';
import Button from '../common/Button';
import ArtisanImage from '../common/ArtisanImage';
import DirectContactButton from '../common/DirectContactButton';
import { Clock, ArrowRight, MessageCircle, Heart, Eye } from 'lucide-react';
import { BUSINESS_CONFIG } from '../../config/business';
import { useWishlist } from '../../context/WishlistContext';

/**
 * High-End Artisan Product Card
 * Designed with luxury editorial aesthetic, gentle hover lift, and image zoom.
 */
export const ProductCard = ({ product, className = '', onQuickView }) => {
  if (!product) return null;

  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorited = isInWishlist(product._id);

  const quickWhatsAppUrl = BUSINESS_CONFIG.getProductInquiryUrl({
    productName: product.title,
    price: product.price,
    selectedColor: product.availableColors?.[0] || '',
  });

  // Calculate availability: Available, Limited, Made to Order, Unavailable
  const getAvailability = () => {
    if (product.availability) {
      const lower = product.availability.toLowerCase();
      if (lower.includes('limit')) return { label: 'Limited', variant: 'terracotta' };
      if (lower.includes('order')) return { label: 'Made to Order', variant: 'craft' };
      if (lower.includes('unavail')) return { label: 'Unavailable', variant: 'outline' };
      return { label: 'Available', variant: 'sage' };
    }
    if (product.isAvailable === false || (product.stock === 0 && !product.isMadeToOrder)) {
      return { label: 'Unavailable', variant: 'outline' };
    }
    if (product.isMadeToOrder) {
      return { label: 'Made to Order', variant: 'craft' };
    }
    if (product.stock !== undefined && product.stock > 0 && product.stock <= 2) {
      return { label: 'Limited', variant: 'terracotta' };
    }
    return { label: 'Available', variant: 'sage' };
  };

  const availabilityInfo = getAvailability();

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`group relative flex flex-col justify-between rounded-3xl bg-artisan-cream border border-artisan-heather hover:border-artisan-softBrown/50 transition-all duration-300 hover:shadow-card p-5 sm:p-6 ${className}`}
    >
      <div className="space-y-4">
        {/* Badges Header & Wishlist Button */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="craft" size="sm">
            {product.craftTechnique || 'Handmade'}
          </Badge>
          <div className="flex items-center gap-2">
            <Badge variant={availabilityInfo.variant} size="sm">
              {availabilityInfo.label}
            </Badge>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product);
              }}
              className="p-1.5 rounded-full hover:bg-artisan-sandstone text-artisan-softBrown hover:text-artisan-terracotta transition tap-target"
              title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFavorited
                    ? 'fill-artisan-terracotta text-artisan-terracotta'
                    : 'text-artisan-softBrown'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Visual Showcase with ArtisanImage and subtle hover zoom */}
        <div className="relative overflow-hidden rounded-2xl">
          <Link
            to={`/product/${product.slug}`}
            className="block"
            tabIndex={-1}
            aria-hidden="true"
          >
            <ArtisanImage
              src={product.images?.[0]?.url}
              alt={product.title}
              aspectRatio="aspect-[4/3]"
              craftTechnique={product.craftTechnique}
              title={product.title}
              imageClassName="group-hover:scale-105 transition-transform duration-700 ease-artisan"
            />
          </Link>
          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-artisan-ivory/95 backdrop-blur-xs text-xs font-semibold text-artisan-earthBrown border border-artisan-heather shadow-subtle opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1.5 hover:bg-white hover:text-artisan-terracotta"
              title="Quick view product details"
            >
              <Eye className="w-3.5 h-3.5 text-artisan-terracotta" />
              <span>Quick View</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <Link to={`/product/${product.slug}`} className="block group-hover:text-artisan-terracotta transition">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-artisan-earthBrown tracking-tight line-clamp-1">
              {product.title}
            </h3>
          </Link>
          <p className="text-xs text-artisan-softBrown font-medium line-clamp-1">
            {product.material}
          </p>
        </div>

        {product.description && (
          <p className="text-xs text-artisan-softBrown leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price & Lead Time */}
        <div className="pt-2 flex items-baseline justify-between border-t border-artisan-heather/60">
          <span className="font-serif text-xl font-bold text-artisan-terracotta">
            ₹{product.price?.toLocaleString('en-IN')}
          </span>

          {product.isMadeToOrder && (
            <span className="inline-flex items-center gap-1 text-[11px] text-artisan-softBrown font-medium">
              <Clock className="w-3.5 h-3.5 text-artisan-terracotta/80" />
              <span>~{product.craftingLeadDays || 3}d crafting</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 space-y-2">
        <Link to={`/product/${product.slug}`} className="block">
          <Button size="md" className="w-full justify-between group/btn">
            <span>View Details & Order</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>

        <div className="flex justify-center pt-1">
          <DirectContactButton
            action={product.isAvailable === false ? 'ask_availability' : 'ask_product'}
            product={product}
            label={product.isAvailable === false ? 'Ask About Availability' : 'Ask About This Product'}
            variant="subtle"
            size="sm"
          />
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;
