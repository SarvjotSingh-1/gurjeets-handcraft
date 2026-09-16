import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Heart,
  MessageCircle,
  Phone,
  Clock,
  CheckCircle2,
  Sliders,
  Gift,
  Palette,
  Ruler,
  Star,
  Quote,
  ShieldCheck,
  Scissors,
  Layers,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProductCard from '../../components/product/ProductCard';
import ProductCardSkeleton from '../../components/product/ProductCardSkeleton';
import QuickViewModal from '../../components/product/QuickViewModal';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import SEO from '../../components/common/SEO';
import { BUSINESS_CONFIG } from '../../config/business';
import productService from '../../api/productService';
import reviewService from '../../api/reviewService';

export const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    setProductsError(null);
    try {
      const res = await productService.getProducts({ limit: 8 });
      setProducts(res.products || []);
    } catch (err) {
      console.warn('Failed to load home creations:', err.message);
      setProductsError(err.message || 'Unable to load handcrafted creations from the studio');
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    setReviewsError(null);
    try {
      const liveReviews = await reviewService.getRecentApprovedReviews(6);
      setReviews(liveReviews);
    } catch (err) {
      console.warn('Failed to load reviews:', err.message);
      setReviewsError(err.message || 'Unable to load reviews right now');
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchReviews();
  }, [fetchProducts, fetchReviews]);


  // Category Collection Cards Data
  const categories = [
    {
      id: 'scarves',
      title: 'Handmade Woolen Scarves',
      categoryParam: 'scarves',
      desc: 'Generously proportioned neck scarves knitted with pure merino and highland wool.',
      stitch: 'Hand-Knitted Ribs & Cables',
      badge: 'Bestselling Comfort',
      icon: '🧣',
      accentColor: 'bg-[#EDE7DE]',
    },
    {
      id: 'gloves',
      title: 'Handmade Woolen Gloves',
      categoryParam: 'gloves',
      desc: 'Snug, anatomically shaped gloves crafted for warmth, flexibility, and daily wear.',
      stitch: 'Fitted Needle Knitting',
      badge: 'Snug Finger Fit',
      icon: '🧤',
      accentColor: 'bg-[#F2ECE4]',
    },
    {
      id: 'beanies',
      title: 'Caps & Beanies',
      categoryParam: 'beanies',
      desc: 'Cozy woolen beanies with textured turn-up brims crocheted for chilly winter winds.',
      stitch: 'Structural Crochet',
      badge: 'Wind Resistant',
      icon: '🧢',
      accentColor: 'bg-[#EAE4D9]',
    },
    {
      id: 'mufflers',
      title: 'Woolen Mufflers',
      categoryParam: 'mufflers',
      desc: 'Classic drapeable mufflers made with airy stitches for lightweight neck protection.',
      stitch: 'Classic Wool Drape',
      badge: 'Timeless Warmth',
      icon: '🧣',
      accentColor: 'bg-[#F0EAE1]',
    },
    {
      id: 'socks',
      title: 'Hand-Knitted Socks',
      categoryParam: 'socks',
      desc: 'Warm woolen bed and lounge socks with reinforced heels and seamless toe joins.',
      stitch: 'Double-Pointed Needles',
      badge: 'Cushioned Soles',
      icon: '🧦',
      accentColor: 'bg-[#ECE5DC]',
    },
    {
      id: 'custom',
      title: 'Other Woolen Handcrafts',
      categoryParam: 'all',
      desc: 'Bespoke custom pieces, woolen shawls, cup cozies, and personalized seasonal creations.',
      stitch: 'Crochet & Knitting',
      badge: 'Custom Sized',
      icon: '🧶',
      accentColor: 'bg-[#E6DFD4]',
    },
  ];

  // Process Steps Data
  const processSteps = [
    {
      number: '01',
      title: 'Choose the Yarn',
      desc: 'Carefully curating pure merino, soft wool blends, and natural fibers that feel pleasant and gentle against sensitive skin.',
    },
    {
      number: '02',
      title: 'Select the Design',
      desc: 'Designing stitch patterns—from thermal fisherman ribbing and honeycomb cables to dimensional crochet shells.',
    },
    {
      number: '03',
      title: 'Crochet / Knit by Hand',
      desc: 'Row by row, every stitch is individually worked using wooden knitting needles and metal crochet hooks with steady tension.',
    },
    {
      number: '04',
      title: 'Finishing & Quality Check',
      desc: 'Neatly weaving in all yarn ends, gentle steam blocking to lock dimensions, and verifying seamless integrity.',
    },
    {
      number: '05',
      title: 'Carefully Prepared for You',
      desc: 'Packed in breathable eco-friendly paper, wrapped with handwritten care instructions, and prepared for dispatch.',
    },
  ];

  // Custom Orders WhatsApp pre-filled link
  const customOrderWhatsAppUrl = BUSINESS_CONFIG.createWhatsAppUrl(
    'Hello Gurjeet, I have something special in mind and would like to discuss a custom handmade woolen order (color, size, pattern, and gifting requirements)!'
  );

  // General Questions WhatsApp pre-filled link
  const generalQuestionWhatsAppUrl = BUSINESS_CONFIG.createWhatsAppUrl(
    'Hello Gurjeet, I have a question about one of your handcrafted woolen creations!'
  );

  return (
    <div className="space-y-24 sm:space-y-36">
      <SEO
        title="Gurjeet's Handcraft | Handmade Woolen Artisan Studio"
        description="Authentic handmade woolen scarves, beanies, gloves, and mufflers hand-knitted and crocheted with love by Gurjeet using pure merino and highland wool."
        keywords={[
          'handmade woolen scarves',
          'hand-knitted beanies',
          'crochet mufflers',
          'pure merino wool knitwear',
          'handmade winter gloves',
          'artisan woolen clothes',
          'Gurjeet handcraft',
          'custom handmade woolen orders',
        ]}
        canonical="/"
        ogType="website"
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: "Gurjeet's Handcraft",
            url: 'https://gurjeetshandcraft.com',
            description:
              'Authentic handmade woolen scarves, beanies, gloves, and mufflers hand-knitted and crocheted with love by Gurjeet.',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://gurjeetshandcraft.com/shop?search={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: "Gurjeet's Handcraft",
            image: 'https://gurjeetshandcraft.com/assets/yarn-icon.svg',
            telephone: '+91-7018183172',
            priceRange: '₹₹',
            currenciesAccepted: 'INR',
            address: {
              '@type': 'PostalAddress',
              addressRegion: 'Himachal Pradesh',
              addressCountry: 'IN',
            },
            description:
              'Artisan studio dedicated to slow-made, handcrafted woolen knitwear and crochet creations made from pure natural fibers.',
          },
        ]}
      />

      {/* =========================================================================
          SECTION 1: VISUALLY POWERFUL HERO SECTION
          ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl sm:rounded-[36px] bg-artisan-cream border border-artisan-heather p-8 sm:p-14 lg:p-20 shadow-cozy"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Supporting Story */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-artisan font-semibold text-artisan-terracotta bg-artisan-terracottaLight px-3.5 py-1.5 rounded-full border border-artisan-terracotta/20">
                Pure Wool &bull; Handmade Atelier
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-artisan-earthBrown leading-[1.1] tracking-tight">
              Handmade with Yarn, Patience & Love.
            </h1>

            <p className="text-base sm:text-lg text-artisan-softBrown leading-relaxed max-w-xl">
              Authentic woolen creations personally hand-crafted by <strong>Gurjeet</strong> using wooden knitting needles and crochet hooks. Every scarf, beanie, pair of gloves, and muffler possesses natural thermal warmth, tactile comfort, and individual character that no factory can duplicate.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/shop">
                <Button size="lg" className="gap-2 shadow-card group">
                  <span>Explore Handmade Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/custom-orders">
                <Button variant="secondary" size="lg">
                  Custom Order
                </Button>
              </Link>
            </div>

            {/* Credibility Badges */}
            <div className="pt-6 border-t border-artisan-heather/70 flex flex-wrap items-center gap-6 text-xs text-artisan-softBrown font-medium">
              <span className="flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-artisan-terracotta" /> 100% Hand-Crafted
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-artisan-terracotta" /> Made in Small Batches
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-artisan-terracotta" /> Made-to-Order Flexibility
              </span>
            </div>
          </div>

          {/* Right Column: Large Beautiful Editorial Image Area */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md rounded-3xl bg-artisan-ivory p-6 sm:p-8 border border-artisan-heather shadow-card space-y-6">
              {/* Visual Showcase Frame */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-artisan-sandstone/40 border border-artisan-heather group">
                <img
                  src="https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop&q=80"
                  alt="Pure Merino Wool Handcrafted Scarf Texture"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-artisan"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-artisan-earthBrown/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-artisan-cream text-xs flex items-center justify-between">
                  <span className="font-serif font-bold tracking-wide">Pure Merino Wool Stitch</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/40 backdrop-blur-xs">
                    Hand-Knitted
                  </span>
                </div>
              </div>

              {/* Artisan Note */}
              <div className="text-center space-y-1.5">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-artisan-terracotta">
                  Slow Craft Philosophy
                </span>
                <h2 className="font-serif text-xl font-bold text-artisan-earthBrown">
                  "One stitch at a time."
                </h2>
                <p className="text-xs text-artisan-softBrown leading-relaxed">
                  "There is quiet joy in knitting row by row. You can feel the living warmth of pure wool taking shape under your fingers."
                </p>
              </div>

              {/* Direct Studio Contact Pill */}
              <div className="p-3.5 rounded-2xl bg-artisan-cream border border-artisan-heather flex items-center justify-between text-xs">
                <span className="text-artisan-softBrown font-medium">Direct Inquiries:</span>
                <a
                  href={BUSINESS_CONFIG.whatsappBaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-artisan-earthBrown hover:text-artisan-terracotta inline-flex items-center gap-1.5 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>WhatsApp: {BUSINESS_CONFIG.displayPhone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* =========================================================================
          SECTION 2: "MADE BY GURJEET" (AUTHENTIC ATELIER STORY)
          ========================================================================= */}
      <section className="max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2">
          <Badge variant="craft">Authentic Slow Craft</Badge>
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-artisan-earthBrown tracking-tight">
          Made by Gurjeet
        </h2>

        <p className="text-base sm:text-lg text-artisan-softBrown leading-relaxed">
          Gurjeet's Handcraft is not a factory, not an automated dropshipping store, and not a faceless reseller. Every single woolen item available here is personally crafted by hand using wooden knitting needles and crochet hooks.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-left">
          <div className="p-6 rounded-2xl bg-artisan-cream border border-artisan-heather space-y-2">
            <h3 className="font-serif font-bold text-artisan-earthBrown text-base">
              Personal Needles & Hooks
            </h3>
            <p className="text-xs text-artisan-softBrown leading-relaxed">
              No industrial weaving machines. Every loop, rib, and edge is formed by human hands, ensuring tension that adapts comfortably to your body.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-artisan-cream border border-artisan-heather space-y-2">
            <h3 className="font-serif font-bold text-artisan-earthBrown text-base">
              Pure Natural Wools
            </h3>
            <p className="text-xs text-artisan-softBrown leading-relaxed">
              Carefully chosen yarns that deliver deep insulation on freezing mornings while staying gentle and breathable against the skin.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-artisan-cream border border-artisan-heather space-y-2">
            <h3 className="font-serif font-bold text-artisan-earthBrown text-base">
              Crafted Upon Request
            </h3>
            <p className="text-xs text-artisan-softBrown leading-relaxed">
              Gurjeet discusses sizes, color shades, and timelines with you directly on WhatsApp before creating your woolen heirloom.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: FEATURED HANDMADE COLLECTION (CATEGORIES SHOWCASE)
          ========================================================================= */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-artisan-heather pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-artisan-softBrown font-semibold">
              Curated Woolen Creations
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-artisan-earthBrown">
              Featured Handmade Collection
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold uppercase tracking-wider text-artisan-terracotta hover:underline inline-flex items-center gap-1.5"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={cat.categoryParam === 'all' ? '/custom-orders' : `/shop?category=${cat.categoryParam}`}
              className="group p-6 sm:p-8 rounded-3xl bg-artisan-cream border border-artisan-heather hover:border-artisan-softBrown/50 transition-all duration-300 hover:shadow-card flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2.5 rounded-2xl bg-artisan-ivory border border-artisan-heather/70 group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </span>
                  <span className="text-[11px] font-semibold text-artisan-softBrown px-3 py-1 rounded-full bg-artisan-ivory border border-artisan-heather">
                    {cat.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-bold text-artisan-earthBrown group-hover:text-artisan-terracotta transition">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-artisan-softBrown leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-artisan-heather/70 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-artisan-softBrown">
                  {cat.stitch}
                </span>
                <span className="font-semibold text-artisan-terracotta inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FEATURED PRODUCTS (WITH WISHLIST & QUICK VIEW)
          ========================================================================= */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-artisan-heather pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-artisan-softBrown font-semibold">
              Ready & Made to Order
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-artisan-earthBrown">
              Featured Pieces from the Needles
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold uppercase tracking-wider text-artisan-terracotta hover:underline inline-flex items-center gap-1.5"
          >
            <span>View All Pieces</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProductCardSkeleton count={3} />
          </div>
        ) : productsError ? (
          <ErrorState
            title="Unable to Load Featured Pieces"
            message={productsError}
            onRetry={fetchProducts}
          />
        ) : products.length === 0 ? (
          <EmptyState
            title="Atelier Preparing New Creations"
            description="Gurjeet is currently busy at the wooden needles preparing the upcoming batch of woolen pieces. You can request a custom order in your preferred yarn and shade."
            actionLabel="Request a Custom Creation"
            actionLink="/custom-orders"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.slice(0, 3).map((item) => (
              <ProductCard
                key={item._id}
                product={item}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 5: THE HANDMADE PROCESS (VISUAL STORYTELLING)
          ========================================================================= */}
      <section className="rounded-3xl sm:rounded-[36px] bg-artisan-sandstone/40 border border-artisan-heather p-8 sm:p-14 lg:p-16 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="craft">Craftsmanship Timeline</Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown">
            The Handmade Process
          </h2>
          <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
            From the raw hank of wool to your finished woolen piece, here is how each creation comes to life:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 sm:gap-4 relative">
          {processSteps.map((step, idx) => (
            <div
              key={step.number}
              className="p-6 rounded-2xl bg-artisan-ivory border border-artisan-heather shadow-subtle space-y-3 relative group hover:border-artisan-terracotta/40 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-bold text-artisan-terracotta">
                  {step.number}
                </span>
                <span className="w-2 h-2 rounded-full bg-artisan-terracotta/40 group-hover:bg-artisan-terracotta transition" />
              </div>
              <h3 className="font-serif text-base font-bold text-artisan-earthBrown">
                {step.title}
              </h3>
              <p className="text-xs text-artisan-softBrown leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: CUSTOM ORDERS (FULL-WIDTH HIGHLIGHT & WHATSAPP CTA)
          ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl sm:rounded-[36px] bg-artisan-cream border border-artisan-heather p-8 sm:p-14 lg:p-16 shadow-card">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-artisan-terracotta" />
            <span className="text-xs font-bold uppercase tracking-widest text-artisan-terracotta">
              Bespoke Handcraft Service
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-artisan-earthBrown tracking-tight leading-tight">
            Have something special in mind?
          </h2>

          <p className="text-sm sm:text-base text-artisan-softBrown leading-relaxed">
            Every winter wardrobe is personal. Gurjeet welcomes custom orders where you can discuss specific sizing, preferred color blends, tailored scarf lengths, or bespoke handmade gift sets for loved ones.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs font-semibold text-artisan-earthBrown">
            <div className="p-3 rounded-xl bg-artisan-ivory border border-artisan-heather flex flex-col items-center gap-1.5">
              <Palette className="w-4 h-4 text-artisan-terracotta" />
              <span>Yarn Color</span>
            </div>
            <div className="p-3 rounded-xl bg-artisan-ivory border border-artisan-heather flex flex-col items-center gap-1.5">
              <Ruler className="w-4 h-4 text-artisan-terracotta" />
              <span>Exact Size</span>
            </div>
            <div className="p-3 rounded-xl bg-artisan-ivory border border-artisan-heather flex flex-col items-center gap-1.5">
              <Layers className="w-4 h-4 text-artisan-terracotta" />
              <span>Stitch Design</span>
            </div>
            <div className="p-3 rounded-xl bg-artisan-ivory border border-artisan-heather flex flex-col items-center gap-1.5">
              <Sliders className="w-4 h-4 text-artisan-terracotta" />
              <span>Custom Pattern</span>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-artisan-ivory border border-artisan-heather flex flex-col items-center gap-1.5">
              <Gift className="w-4 h-4 text-artisan-terracotta" />
              <span>Gift Wrapping</span>
            </div>
          </div>

          {/* CTA: Discuss Your Custom Order */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href={customOrderWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#25D366] text-white text-xs sm:text-sm font-bold hover:bg-[#20ba59] transition shadow-card tap-target"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Discuss Your Custom Order</span>
            </a>

            <Link to="/custom-orders">
              <Button variant="secondary" size="lg">
                View Custom Order Guide
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: WHY HANDMADE? (CORE ARTISAN PRINCIPLES)
          ========================================================================= */}
      <section className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-widest text-artisan-terracotta font-semibold">
            Honest Integrity
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown">
            Why Choose Handmade?
          </h2>
          <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
            The distinct values that separate slow handmade woolen craft from fast industrial knitwear.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="p-6 rounded-2xl bg-artisan-cream border border-artisan-heather space-y-2.5">
            <span className="text-xs font-mono font-bold text-artisan-terracotta">01</span>
            <h3 className="font-serif text-lg font-bold text-artisan-earthBrown">
              Personally Crafted
            </h3>
            <p className="text-xs text-artisan-softBrown leading-relaxed">
              Every single stitch is guided by human hands. You receive authentic craftsmanship, not mass-produced fabric.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-artisan-cream border border-artisan-heather space-y-2.5">
            <span className="text-xs font-mono font-bold text-artisan-terracotta">02</span>
            <h3 className="font-serif text-lg font-bold text-artisan-earthBrown">
              Small-Batch Quality
            </h3>
            <p className="text-xs text-artisan-softBrown leading-relaxed">
              Only a handful of pieces are made at any one time. This ensures total attention to stitch tension and fiber loft.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-artisan-cream border border-artisan-heather space-y-2.5">
            <span className="text-xs font-mono font-bold text-artisan-terracotta">03</span>
            <h3 className="font-serif text-lg font-bold text-artisan-earthBrown">
              Thoughtful Finishing
            </h3>
            <p className="text-xs text-artisan-softBrown leading-relaxed">
              All yarn ends are hand-woven in securely with tapestry needles. Edges are softly steam-blocked to preserve structure.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-artisan-cream border border-artisan-heather space-y-2.5">
            <span className="text-xs font-mono font-bold text-artisan-terracotta">04</span>
            <h3 className="font-serif text-lg font-bold text-artisan-earthBrown">
              Unique Pieces
            </h3>
            <p className="text-xs text-artisan-softBrown leading-relaxed">
              Because it is handmade, every piece carries subtle organic character—truly one of a kind.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-artisan-cream border border-artisan-heather space-y-2.5">
            <span className="text-xs font-mono font-bold text-artisan-terracotta">05</span>
            <h3 className="font-serif text-lg font-bold text-artisan-earthBrown">
              Personal Attention
            </h3>
            <p className="text-xs text-artisan-softBrown leading-relaxed">
              You speak directly with the maker. Gurjeet answers questions and confirms orders personally.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: CUSTOMER PRAISE & REVIEWS (AUTHENTIC VERIFIED COMMISSIONS)
          ========================================================================= */}
      <section className="rounded-3xl bg-artisan-cream border border-artisan-heather p-8 sm:p-14 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="terracotta">Artisan Community</Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown">
            Warm Words from Recent Recipients
          </h2>
          <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
            Authentic verified feedback from recipients of Gurjeet's handmade woolen creations.
          </p>
        </div>

        {loadingReviews ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-artisan-ivory border border-artisan-heather shadow-subtle space-y-4 animate-pulse min-h-[180px]"
              >
                <div className="h-4 w-24 bg-artisan-sandstone/70 rounded" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-artisan-sandstone/50 rounded" />
                  <div className="h-3 w-4/5 bg-artisan-sandstone/50 rounded" />
                </div>
                <div className="pt-4 border-t border-artisan-heather/50 flex justify-between">
                  <div className="h-3 w-20 bg-artisan-sandstone/60 rounded" />
                  <div className="h-3 w-24 bg-artisan-sandstone/40 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : reviewsError ? (
          <ErrorState
            title="Unable to Load Community Reviews"
            message={reviewsError}
            onRetry={fetchReviews}
          />
        ) : reviews.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-artisan-ivory border border-artisan-heather text-center max-w-2xl mx-auto space-y-4 shadow-subtle">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-artisan-sandstone/60 flex items-center justify-center text-2xl">
              🧶
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-xl font-bold text-artisan-earthBrown">
                Slow-Crafted with Authentic Care
              </h3>
              <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
                Every single piece from Gurjeet's atelier is slow-knitted or crocheted row by row. Verified customer reviews will appear here as each custom piece and seasonal order is received and cherished.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link to="/shop">
                <Button size="sm">Explore Handcrafted Pieces</Button>
              </Link>
              <a
                href={BUSINESS_CONFIG.createWhatsAppUrl(
                  'Hello Gurjeet, I would like to inquire about your handmade woolen creations!'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#25D366]/10 text-artisan-earthBrown text-xs font-semibold border border-[#25D366]/30 hover:bg-[#25D366]/20 transition tap-target"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Ask Gurjeet on WhatsApp</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-6 rounded-2xl bg-artisan-ivory border border-artisan-heather shadow-subtle space-y-4 flex flex-col justify-between hover:border-artisan-terracotta/40 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-artisan-terracotta">
                      {[...Array(Math.min(Math.max(Number(rev.rating) || 5, 1), 5))].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-artisan-terracotta text-artisan-terracotta" />
                      ))}
                    </div>
                    {rev.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-artisan-heather/70 text-xs space-y-1">
                  <p className="font-serif font-bold text-artisan-earthBrown">
                    {rev.userName || 'Verified Customer'}
                  </p>
                  {rev.product?.slug ? (
                    <Link
                      to={`/product/${rev.product.slug}`}
                      className="text-[11px] text-artisan-terracotta hover:underline font-medium block truncate"
                    >
                      {rev.product.title}
                    </Link>
                  ) : rev.product?.title ? (
                    <p className="text-[11px] text-artisan-terracotta font-medium truncate">
                      {rev.product.title}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 9: CONTACT / WHATSAPP & PHONE CTA
          ========================================================================= */}
      <section className="rounded-3xl sm:rounded-[36px] bg-artisan-espresso text-artisan-cream p-8 sm:p-14 text-center space-y-6 shadow-cozy">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-artisan-terracotta">
            Direct Personal Access
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Have a question about a product?
          </h2>
          <p className="text-xs sm:text-sm text-artisan-cream/80 leading-relaxed max-w-xl mx-auto">
            Whether you need sizing advice, want to confirm current yarn stock, or want to check if a specific color can be crafted, Gurjeet is here to help personally.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {/* WhatsApp CTA */}
          <a
            href={generalQuestionWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#25D366] text-white text-xs sm:text-sm font-bold hover:bg-[#20ba59] transition shadow-card tap-target"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp: {BUSINESS_CONFIG.displayPhone}</span>
          </a>

          {/* Call / Query CTA */}
          <a
            href={`tel:${BUSINESS_CONFIG.phone}`}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-artisan-cream text-artisan-earthBrown text-xs sm:text-sm font-bold hover:bg-white transition tap-target"
          >
            <Phone className="w-4 h-4" />
            <span>Call / Query: {BUSINESS_CONFIG.displayPhone}</span>
          </a>
        </div>

        <p className="text-[11px] text-artisan-cream/60">
          Studio Hours: {BUSINESS_CONFIG.studioHours}
        </p>
      </section>

      {/* =========================================================================
          SECTION 10: GENTLE STUDIO UPDATES & CONNECTION NOTE
          ========================================================================= */}
      <section className="text-center max-w-xl mx-auto space-y-4 pt-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-artisan-cream border border-artisan-heather flex items-center justify-center text-2xl">
          🧶
        </div>
        <h3 className="font-serif text-2xl font-bold text-artisan-earthBrown">
          Stay Connected with the Studio
        </h3>
        <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
          Gurjeet introduces new yarn shades, seasonal neckwear, and winter specials in small handcrafted batches.
        </p>

        <div className="pt-2">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-xs font-semibold text-artisan-terracotta hover:underline"
          >
            <span>Have custom inquiries? Reach Gurjeet's studio anytime</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

export default HomePage;
