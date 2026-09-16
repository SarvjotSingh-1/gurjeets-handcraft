import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, MessageCircle, Heart, Clock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ArtisanImage from '../common/ArtisanImage';
import Badge from '../common/Badge';
import Button from '../common/Button';
import DirectContactButton from '../common/DirectContactButton';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { BUSINESS_CONFIG } from '../../config/business';

export const QuickViewModal = ({ product, isOpen, onClose }) => {
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  useEffect(() => {
    if (product) {
      setSelectedColor(product.availableColors?.[0] || 'Natural Pure Wool');
      setQuantity(1);
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const isFavorited = isInWishlist(product._id);

  const whatsAppInquiryUrl = BUSINESS_CONFIG.getProductInquiryUrl({
    productName: product.title,
    quantity,
    price: product.price,
    selectedColor,
  });

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor);
    addToast(`Added ${quantity}x "${product.title}" (${selectedColor}) to your bag!`, 'success');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-artisan-earthBrown/60 backdrop-blur-xs"
          aria-hidden="true"
        />

        {/* Dialog Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-3xl rounded-3xl bg-artisan-ivory border border-artisan-heather p-6 sm:p-8 shadow-modal z-10 max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quickview-title"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-artisan-softBrown hover:text-artisan-earthBrown hover:bg-artisan-cream transition tap-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-artisan-terracotta"
            aria-label="Close Quick View"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 pt-2">
            {/* Left: Product Showcase */}
            <div className="md:col-span-6 space-y-4">
              <div className="overflow-hidden rounded-2xl border border-artisan-heather">
                <ArtisanImage
                  src={product.images?.[0]?.url}
                  alt={product.title}
                  aspectRatio="aspect-[4/3]"
                  craftTechnique={product.craftTechnique}
                  title={product.title}
                  imageClassName="hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Handcrafted note */}
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-artisan-cream border border-artisan-heather text-xs text-artisan-softBrown">
                <Sparkles className="w-4 h-4 text-artisan-terracotta flex-shrink-0" />
                <span>
                  Individually crafted by <strong>Gurjeet</strong> using {product.craftTechnique?.toLowerCase() || 'handmade'} technique.
                </span>
              </div>
            </div>

            {/* Right: Specifications & Inquiries */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                {/* Badges */}
                <div className="flex items-center gap-2">
                  <Badge variant="craft" size="sm">
                    {product.craftTechnique || 'Handmade'}
                  </Badge>
                  <Badge variant="sage" size="sm">
                    {product.isMadeToOrder ? 'Made to Order' : 'Ready to Ship'}
                  </Badge>
                </div>

                <h2 id="quickview-title" className="font-serif text-2xl font-bold text-artisan-earthBrown leading-tight">
                  {product.title}
                </h2>

                <p className="font-serif text-2xl font-bold text-artisan-terracotta">
                  ₹{product.price?.toLocaleString('en-IN')}
                </p>

                <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
                  {product.description}
                </p>

                {/* Material & Specs */}
                <div className="space-y-1.5 pt-2 border-t border-artisan-heather/70 text-xs">
                  <div className="flex justify-between text-artisan-softBrown">
                    <span>Yarn / Material:</span>
                    <span className="font-semibold text-artisan-earthBrown">{product.material}</span>
                  </div>
                  {product.dimensions && (
                    <div className="flex justify-between text-artisan-softBrown">
                      <span>Dimensions:</span>
                      <span className="font-semibold text-artisan-earthBrown">{product.dimensions}</span>
                    </div>
                  )}
                  {product.isMadeToOrder && (
                    <div className="flex justify-between text-artisan-softBrown">
                      <span>Crafting Timeline:</span>
                      <span className="font-semibold text-artisan-earthBrown flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-artisan-terracotta" />
                        ~{product.craftingLeadDays || 3} days per piece
                      </span>
                    </div>
                  )}
                </div>

                {/* Color Variants */}
                {product.availableColors?.length > 0 && (
                  <div className="pt-2 space-y-1.5">
                    <span className="text-xs font-semibold text-artisan-earthBrown block">
                      Select Wool Tone: <span className="font-normal text-artisan-softBrown">{selectedColor}</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.availableColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
                            selectedColor === color
                              ? 'bg-artisan-earthBrown text-artisan-ivory shadow-xs'
                              : 'bg-artisan-cream border border-artisan-heather text-artisan-earthBrown hover:border-artisan-softBrown'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-artisan-heather/80 space-y-2.5">
                <div className="flex items-center gap-3">
                  <Button
                    size="md"
                    className="flex-1 justify-center gap-2"
                    onClick={handleAddToCart}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Shopping Bag</span>
                  </Button>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className="p-3 rounded-2xl border border-artisan-heather bg-artisan-cream hover:border-artisan-softBrown transition tap-target"
                    title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
                    aria-label="Wishlist toggle"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isFavorited
                          ? 'fill-artisan-terracotta text-artisan-terracotta'
                          : 'text-artisan-softBrown'
                      }`}
                    />
                  </button>
                </div>

                {/* Direct "Ask About This Product" CTA */}
                <DirectContactButton
                  action="ask_product"
                  product={product}
                  selectedColor={selectedColor}
                  label="Ask About This Product"
                  variant="whatsapp"
                  size="sm"
                  fullWidth
                />

                <div className="text-center pt-1">
                  <Link
                    to={`/product/${product.slug}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-artisan-softBrown hover:text-artisan-terracotta transition"
                  >
                    <span>View full craft details & specifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickViewModal;
