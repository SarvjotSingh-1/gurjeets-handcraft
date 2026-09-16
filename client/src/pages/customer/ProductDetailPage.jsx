import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ArrowLeft,
  Clock,
  MessageCircle,
  Phone,
  ShoppingBag,
  Info,
  Check,
  Scissors,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Maximize2,
  X,
  Star,
  Layers,
  Palette,
  Ruler,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProductCard from '../../components/product/ProductCard';
import ProductDetailSkeleton from '../../components/product/ProductDetailSkeleton';
import QuickViewModal from '../../components/product/QuickViewModal';
import ErrorState from '../../components/common/ErrorState';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { BUSINESS_CONFIG } from '../../config/business';
import productService from '../../api/productService';
import ProductReviews from '../../components/product/ProductReviews';
import DirectContactButton from '../../components/common/DirectContactButton';
import SEO from '../../components/common/SEO';

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Fetch product and related creations from centralized productService
  const fetchProductData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedImageIndex(0);
      setQuantity(1);

      const current = await productService.getProductByIdOrSlug(slug);
      if (!current) {
        throw new Error(`We couldn't find a creation matching "${slug}".`);
      }

      setProduct(current);
      setSelectedColor(current.availableColors?.[0] || 'Natural Pure Wool');

      // Fetch related items in same category
      if (current.category) {
        const related = await productService.getRelatedProducts(current.category, current.slug, 3);
        setRelatedProducts(related);
      } else {
        setRelatedProducts([]);
      }
    } catch (err) {
      console.error('Failed to load product detail:', err);
      setError(err.message || 'Creation not found or temporarily unavailable');
      setProduct(null);
      setRelatedProducts([]);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchProductData]);

  const isFavorited = product ? isInWishlist(product._id) : false;

  // Gallery image list with guaranteed structure
  const galleryImages = useMemo(() => {
    if (!product || !product.images || product.images.length === 0) {
      return [{ url: '/assets/yarn-icon.svg', alt: product?.title || 'Handmade Woolen Piece' }];
    }
    return product.images;
  }, [product]);

  const currentImage = galleryImages[selectedImageIndex] || galleryImages[0];

  // Calculate 4-State Availability
  const getAvailabilityInfo = (p) => {
    if (!p) return { label: 'Checking', variant: 'outline', desc: '' };
    if (p.availability) {
      const lower = p.availability.toLowerCase();
      if (lower.includes('limit')) return { label: 'Limited Stock', variant: 'terracotta', desc: `Only ${p.stock || 2} ready to ship` };
      if (lower.includes('order')) return { label: 'Made to Order', variant: 'craft', desc: `Handcrafted in ~${p.craftingLeadDays || 4} days` };
      if (lower.includes('unavail')) return { label: 'Currently Unavailable', variant: 'outline', desc: 'Awaiting fresh yarn batch' };
      return { label: 'Available (Ready to Ship)', variant: 'sage', desc: 'Ready for immediate studio dispatch' };
    }
    if (p.isAvailable === false || (p.stock === 0 && !p.isMadeToOrder)) {
      return { label: 'Currently Unavailable', variant: 'outline', desc: 'Awaiting fresh yarn batch' };
    }
    if (p.isMadeToOrder) {
      return { label: 'Made to Order', variant: 'craft', desc: `Handcrafted in ~${p.craftingLeadDays || 4} days` };
    }
    if (p.stock !== undefined && p.stock > 0 && p.stock <= 2) {
      return { label: 'Limited Stock', variant: 'terracotta', desc: `Only ${p.stock} ready to ship` };
    }
    return { label: 'Available (Ready to Ship)', variant: 'sage', desc: 'Ready for immediate studio dispatch' };
  };

  const availabilityInfo = getAvailabilityInfo(product);

  // Generate WhatsApp inquiry text (Primary CTA format specified by business rules)
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const primaryWhatsAppUrl = useMemo(() => {
    if (!product) return BUSINESS_CONFIG.whatsappBaseUrl;
    const colorNote = selectedColor ? ` (${selectedColor})` : '';
    const message =
      `Hello Gurjeet's Handcraft,\n` +
      `I am interested in:\n` +
      `Product: ${product.title}${colorNote}\n` +
      `Price: ₹${product.price}\n` +
      `Quantity: ${quantity}\n` +
      `Product Link: ${currentUrl}\n\n` +
      `I would like to know more about availability and ordering.`;

    return `${BUSINESS_CONFIG.whatsappBaseUrl}?text=${encodeURIComponent(message)}`;
  }, [product, selectedColor, quantity, currentUrl]);

  // Secondary WhatsApp custom inquiry link
  const customWhatsAppUrl = useMemo(() => {
    if (!product) return BUSINESS_CONFIG.whatsappBaseUrl;
    const message =
      `Hello Gurjeet,\n` +
      `I am viewing "${product.title}" and would like to ask if you can make a custom version (custom size, different yarn color, or adjusted dimensions).`;
    return `${BUSINESS_CONFIG.whatsappBaseUrl}?text=${encodeURIComponent(message)}`;
  }, [product]);

  // Handle Add to Shopping Bag
  const handleAddToCart = () => {
    if (!product) return;
    const res = addToCart(product, quantity, selectedColor);
    if (!res || res.success === false) {
      addToast(res?.message || 'Unable to add item to bag.', 'error');
      return;
    }
    setAddedSuccess(true);
    addToast(res.message || `Added ${res.addedQuantity}x "${product.title}" to your bag!`, 'success');
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  // Loading state with high-fidelity skeleton
  if (loading) {
    return <ProductDetailSkeleton />;
  }

  // Error or 404 state
  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 space-y-6">
        <ErrorState
          title="Creation Not Found"
          message={error || "We couldn't find the requested handmade creation in the studio."}
          onRetry={fetchProductData}
        />
        <div className="text-center">
          <Link to="/shop">
            <Button variant="secondary" size="md" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Handmade Shop</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const productKeywords = [
    product.title,
    product.category,
    product.craftTechnique,
    product.material,
    'handmade woolen',
    'hand-knitted winter wear',
    'Gurjeet handcraft',
    'small batch artisan wool',
  ].filter(Boolean);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: galleryImages.map((img) => img.url),
    description:
      product.description ||
      `Authentic ${product.title} personally handcrafted by Gurjeet using pure wool.`,
    sku: String(product._id || ''),
    mpn: product.slug || '',
    brand: {
      '@type': 'Brand',
      name: "Gurjeet's Handcraft",
    },
    category: product.category,
    material: product.material,
    offers: {
      '@type': 'Offer',
      url: `https://gurjeetshandcraft.com/product/${product.slug || slug}`,
      priceCurrency: 'INR',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        product.isAvailable !== false && product.stock > 0
          ? 'https://schema.org/InStock'
          : product.isMadeToOrder
          ? 'https://schema.org/PreOrder'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: "Gurjeet's Handcraft",
      },
    },
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      <SEO
        title={`${product.title} | Handcrafted Woolen Collection | Gurjeet's Handcraft`}
        description={
          product.description ||
          `Buy authentic ${product.title} hand-knitted with ${product.material || 'pure wool'} by Gurjeet. Small batch handcrafted warmth.`
        }
        keywords={productKeywords}
        canonical={`/product/${product.slug || slug}`}
        ogType="product"
        ogImage={currentImage?.url || '/assets/yarn-icon.svg'}
        structuredData={productSchema}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-artisan-softBrown">
        <Link to="/shop" className="hover:text-artisan-terracotta transition flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Shop</span>
        </Link>
        <span>/</span>
        <span className="capitalize">{product.category || 'Handcrafts'}</span>
        <span>/</span>
        <span className="text-artisan-earthBrown font-medium truncate max-w-xs">
          {product.title}
        </span>
      </nav>


      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* =========================================================================
            LEFT COLUMN: IMAGE GALLERY (PRIMARY IMAGE, THUMBNAILS, ZOOM)
            ========================================================================= */}
        <div className="lg:col-span-6 space-y-4">
          {/* Primary Main Image Frame */}
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-artisan-sandstone/30 border border-artisan-heather shadow-card group">
            <img
              src={currentImage?.url}
              alt={currentImage?.alt || product.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/assets/yarn-icon.svg';
                e.currentTarget.classList.add('p-16', 'object-contain', 'opacity-40');
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-artisan cursor-zoom-in"
              onClick={() => setIsZoomOpen(true)}
            />

            {/* Badges Over Image */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <Badge variant="craft" size="sm">
                {product.craftTechnique || 'Handmade'}
              </Badge>
              <Badge variant={availabilityInfo.variant} size="sm">
                {availabilityInfo.label}
              </Badge>
            </div>

            {/* Zoom Action Trigger Button */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="absolute bottom-4 right-4 p-2.5 rounded-2xl bg-artisan-ivory/90 backdrop-blur-xs text-artisan-earthBrown border border-artisan-heather shadow-subtle hover:bg-white transition tap-target"
              title="Click to view full-size zoom"
              aria-label="Enlarge image"
            >
              <Maximize2 className="w-4 h-4 text-artisan-earthBrown" />
            </button>
          </div>

          {/* Thumbnail Gallery Row */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all tap-target flex-shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-artisan-terracotta shadow-xs scale-105'
                      : 'border-artisan-heather hover:border-artisan-softBrown opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt || `${product.title} - Photo view ${idx + 1}, Handcrafted Woolen Detail`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/assets/yarn-icon.svg';
                      e.currentTarget.classList.add('p-3', 'object-contain', 'opacity-40');
                    }}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Quick Craft Note */}
          <div className="p-4 rounded-2xl bg-artisan-cream border border-artisan-heather flex items-center gap-3 text-xs text-artisan-softBrown">
            <Scissors className="w-4 h-4 text-artisan-terracotta flex-shrink-0" />
            <span>
              Individually crafted by <strong>Gurjeet</strong> using pure yarn, wooden needles, and crochet hooks.
            </span>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: DETAILS, PRICING, WISHLIST, QUANTITY & CTAS
            ========================================================================= */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header & Wishlist Button */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-artisan-terracotta font-semibold block mb-1">
                  {product.craftTechnique} &bull; {product.material}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown leading-tight">
                  {product.title}
                </h1>

                {/* Rating & Reviews Jump Link */}
                <a
                  href="#reviews-section"
                  className="inline-flex items-center gap-1.5 text-xs text-artisan-softBrown hover:text-artisan-terracotta transition mt-1.5"
                >
                  <div className="flex items-center text-artisan-amber">
                    <Star className="w-3.5 h-3.5 fill-artisan-amber" />
                  </div>
                  <span className="font-semibold text-artisan-earthBrown">
                    {product.rating > 0 ? product.rating.toFixed(1) : 'Handcrafted'}
                  </span>
                  <span>&bull;</span>
                  <span className="underline">Customer Reviews</span>
                </a>
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className="p-3 rounded-2xl bg-artisan-cream border border-artisan-heather hover:border-artisan-softBrown transition tap-target flex-shrink-0"
                title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
                aria-label="Wishlist toggle"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isFavorited
                      ? 'fill-artisan-terracotta text-artisan-terracotta'
                      : 'text-artisan-softBrown hover:text-artisan-terracotta'
                  }`}
                />
              </button>
            </div>

            {/* Price & Availability Stock Note */}
            <div className="flex flex-wrap items-baseline gap-4 pt-1">
              <span className="font-serif text-3xl font-bold text-artisan-terracotta">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-semibold text-artisan-softBrown flex items-center gap-1.5 bg-artisan-sandstone/60 px-3 py-1 rounded-full">
                <Info className="w-3.5 h-3.5 text-artisan-terracotta" />
                <span>{availabilityInfo.desc}</span>
              </span>

              {/* Direct "Ask About Availability" Action */}
              <DirectContactButton
                action="ask_availability"
                product={product}
                selectedColor={selectedColor}
                label="Ask About Availability"
                variant="subtle"
                size="sm"
              />
            </div>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-artisan-softBrown leading-relaxed">
            {product.description}
          </p>

          {/* Color Selection if available */}
          {product.availableColors?.length > 0 && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-artisan-earthBrown">
                Selected Yarn Tone: <span className="font-bold text-artisan-terracotta">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.availableColors.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium border transition tap-target ${
                      selectedColor === col
                        ? 'border-artisan-earthBrown bg-artisan-earthBrown text-artisan-ivory shadow-xs font-semibold'
                        : 'border-artisan-heather bg-artisan-cream text-artisan-earthBrown hover:bg-artisan-sandstone'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-artisan-earthBrown">
              Quantity
            </label>
            <div className="inline-flex items-center border border-artisan-heather rounded-2xl bg-artisan-cream overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2.5 text-sm font-bold text-artisan-earthBrown hover:bg-artisan-sandstone transition tap-target"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="px-5 py-2.5 text-sm font-bold text-artisan-earthBrown">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2.5 text-sm font-bold text-artisan-earthBrown hover:bg-artisan-sandstone transition tap-target"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Crafting Timeline note if made to order */}
          {product.isMadeToOrder && (
            <div className="p-4 rounded-2xl bg-artisan-cream border border-artisan-heather flex items-start gap-3 text-xs text-artisan-earthBrown">
              <Clock className="w-4 h-4 text-artisan-terracotta flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Handcrafted to Order:</strong>
                <span className="text-artisan-softBrown leading-relaxed">
                  Gurjeet will handcraft this piece specifically for you (~{product.craftingLeadDays || 4} days lead time) before dispatch.
                </span>
              </div>
            </div>
          )}

          {/* =========================================================================
              CALL-TO-ACTION BUTTONS (ZERO PAYMENT GATEWAYS)
              ========================================================================= */}
          <div className="pt-4 space-y-3">
            {/* PRIMARY CTA: "Ask About This Product" */}
            <DirectContactButton
              action="ask_product"
              product={product}
              selectedColor={selectedColor}
              label="Ask About This Product"
              variant="whatsapp"
              size="lg"
              fullWidth
              fallbackToCall
            />

            {/* SECONDARY ROW: Add to Bag & Direct Call */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant={addedSuccess ? 'primary' : 'secondary'}
                size="md"
                onClick={handleAddToCart}
                className="w-full gap-2"
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-artisan-terracotta" />
                    <span>Add to Studio Bag</span>
                  </>
                )}
              </Button>

              <a
                href={`tel:${BUSINESS_CONFIG.phone}`}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-artisan-cream border border-artisan-heather text-xs sm:text-sm font-semibold text-artisan-earthBrown hover:bg-artisan-sandstone transition tap-target"
              >
                <Phone className="w-4 h-4 text-artisan-softBrown" />
                <span>Call Studio: {BUSINESS_CONFIG.displayPhone}</span>
              </a>
            </div>

            {/* Reassurance Notice */}
            <p className="text-[11px] text-center text-artisan-taupe pt-1">
              ✨ Direct artisan communication &bull; Feasibility, delivery timeline, and packaging confirmed personally by Gurjeet.
            </p>
          </div>

          {/* Custom Order Box Callout */}
          <div className="p-5 rounded-2xl bg-artisan-cream/90 border border-artisan-heather space-y-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-artisan-terracotta" />
              <h3 className="font-serif font-bold text-artisan-earthBrown text-base">
                Want a custom version?
              </h3>
            </div>

            <p className="text-xs text-artisan-softBrown leading-relaxed">
              Need this design in a specific length, custom color blend, or adjusted sizing? Gurjeet handcrafts bespoke commissions.
            </p>

            <DirectContactButton
              action="contact_gurjeet"
              details={{
                productType: product.title,
                colorPreference: selectedColor,
              }}
              label="Contact Gurjeet"
              variant="secondary"
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION: "MADE BY GURJEET" (AUTHENTIC CRAFT INTEGRITY)
          ========================================================================= */}
      <section className="rounded-3xl sm:rounded-[36px] bg-artisan-cream border border-artisan-heather p-8 sm:p-14 space-y-6">
        <div className="max-w-3xl space-y-3">
          <Badge variant="craft">Single Artisan Atelier</Badge>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-artisan-earthBrown">
            Made by Gurjeet
          </h2>
          <p className="text-sm text-artisan-softBrown leading-relaxed">
            Every creation in this shop is made by Gurjeet's own hands. There are no outsourced factory lines, no automated knitting machines, and no synthetic mass production. Working with wooden needles and metal crochet hooks, Gurjeet crafts row by row, ensuring natural fiber loft, gentle stretch, and enduring warmth.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-artisan-ivory border border-artisan-heather space-y-1.5 text-xs">
            <h4 className="font-serif font-bold text-artisan-earthBrown text-sm">
              Hand-Selected Wools
            </h4>
            <p className="text-artisan-softBrown">
              Chosen for insulation without scratchiness, keeping you comfortable in chilly weather.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-artisan-ivory border border-artisan-heather space-y-1.5 text-xs">
            <h4 className="font-serif font-bold text-artisan-earthBrown text-sm">
              Individual Attention
            </h4>
            <p className="text-artisan-softBrown">
              Tension is carefully regulated across every stitch to ensure long-lasting durability.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-artisan-ivory border border-artisan-heather space-y-1.5 text-xs">
            <h4 className="font-serif font-bold text-artisan-earthBrown text-sm">
              Direct Communication
            </h4>
            <p className="text-artisan-softBrown">
              You speak directly with the maker for sizing, customizations, and dispatch updates.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: CARE INSTRUCTIONS & SHIPPING INFORMATION
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Care Instructions */}
        <div className="p-6 sm:p-8 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-artisan-terracotta" />
            <h3 className="font-serif text-xl font-bold text-artisan-earthBrown">
              Handmade Wool Care Instructions
            </h3>
          </div>
          <p className="text-xs text-artisan-softBrown leading-relaxed">
            Pure woolen handcrafts last for years when cared for gently:
          </p>
          <ul className="space-y-2 text-xs text-artisan-softBrown">
            {product.careInstructions?.map((instruction, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-artisan-terracotta font-bold">&bull;</span>
                <span>{instruction}</span>
              </li>
            )) || (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-artisan-terracotta font-bold">&bull;</span>
                  <span>Gently hand wash in cool water using a mild wool wash</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-artisan-terracotta font-bold">&bull;</span>
                  <span>Never wring or twist woolen stitches</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-artisan-terracotta font-bold">&bull;</span>
                  <span>Dry flat on a fresh cotton towel away from direct sunlight</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Shipping & Delivery Info */}
        <div className="p-6 sm:p-8 rounded-3xl bg-artisan-cream border border-artisan-heather space-y-4">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-artisan-terracotta" />
            <h3 className="font-serif text-xl font-bold text-artisan-earthBrown">
              Personal Shipping & Safe Packaging
            </h3>
          </div>
          <div className="space-y-3 text-xs text-artisan-softBrown leading-relaxed">
            <p>
              Each item is gently wrapped in breathable craft paper and safely packed directly from the studio.
            </p>
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-artisan-terracotta" />
                <span>Ready items dispatched within 1-2 business days</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-artisan-terracotta" />
                <span>Made to order pieces dispatched upon stitch completion</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-artisan-terracotta" />
                <span>Tracking details sent directly on WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION: CUSTOMER REVIEWS & RATINGS (STRICT VERIFIED PURCHASES)
          ========================================================================= */}
      <ProductReviews productId={product._id} productTitle={product.title} />

      {/* =========================================================================
          SECTION: RELATED HANDMADE CREATIONS
          ========================================================================= */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-4">
          <div className="flex items-end justify-between border-b border-artisan-heather/80 pb-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-artisan-terracotta font-semibold">
                From the Same Collection
              </span>
              <h3 className="font-serif text-2xl font-bold text-artisan-earthBrown">
                More Handcrafted Creations
              </h3>
            </div>
            <Link
              to={`/shop?category=${product.category || 'all'}`}
              className="text-xs font-semibold text-artisan-terracotta hover:underline hidden sm:inline-block"
            >
              View all in category &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel._id}
                product={rel}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Full Screen Image Zoom Modal */}
      <AnimatePresence>
        {isZoomOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setIsZoomOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Enlarged product image"
          >
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition tap-target"
              aria-label="Close zoom preview"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden shadow-modal bg-artisan-cream"
            >
              <img
                src={currentImage?.url}
                alt={currentImage?.alt || product.title}
                className="w-full h-full object-contain max-h-[85vh]"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick View Modal for related items */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

export default ProductDetailPage;
