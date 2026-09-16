import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  Heart,
  MessageCircle,
  RotateCcw,
  Check,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProductCard from '../../components/product/ProductCard';
import ProductCardSkeleton from '../../components/product/ProductCardSkeleton';
import QuickViewModal from '../../components/product/QuickViewModal';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import SEO from '../../components/common/SEO';
import productService from '../../api/productService';
import { BUSINESS_CONFIG } from '../../config/business';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state synchronization
  const currentCategory = searchParams.get('category') || 'all';
  const urlSearch = searchParams.get('search') || '';

  // Data & View State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Categories as explicitly requested
  const categories = [
    { label: 'All', value: 'all' },
    { label: 'Scarves', value: 'scarves' },
    { label: 'Gloves', value: 'gloves' },
    { label: 'Caps & Beanies', value: 'beanies' },
    { label: 'Mufflers', value: 'mufflers' },
    { label: 'Socks', value: 'socks' },
    { label: 'Other Woolen Handcrafts', value: 'other' },
  ];

  // Convert selectedPriceRange to min/max numbers
  const getPriceBounds = (range) => {
    switch (range) {
      case 'under-750':
        return { maxPrice: 750 };
      case '750-1200':
        return { minPrice: 750, maxPrice: 1200 };
      case '1200-1800':
        return { minPrice: 1200, maxPrice: 1800 };
      case 'above-1800':
        return { minPrice: 1800 };
      default:
        return {};
    }
  };

  // Fetch catalog from centralized API service
  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const priceBounds = getPriceBounds(selectedPriceRange);
      const params = {
        category: currentCategory !== 'all' ? currentCategory : undefined,
        search: searchQuery.trim() || undefined,
        minPrice: priceBounds.minPrice,
        maxPrice: priceBounds.maxPrice,
        availability: selectedAvailability !== 'all' ? selectedAvailability.replace('-', '_') : undefined,
        featured: featuredOnly ? true : undefined,
        sort: sortBy.replace('-', '_'),
        limit: 50,
      };

      const result = await productService.getProducts(params);
      setProducts(result.products || []);
    } catch (err) {
      console.error('Failed to load shop catalog:', err);
      setError(err.message || 'Unable to load handmade collection from the studio');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentCategory, searchQuery, selectedPriceRange, selectedAvailability, featuredOnly, sortBy]);

  // Synchronize searchQuery with search param if user lands from global search
  useEffect(() => {
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  // Fetch catalog whenever filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCatalog();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchCatalog]);

  // Handle category tab change
  const handleCategoryChange = (val) => {
    const nextParams = new URLSearchParams(searchParams);
    if (val === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', val);
    }
    setSearchParams(nextParams);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedAvailability('all');
    setSelectedPriceRange('all');
    setFeaturedOnly(false);
    setSortBy('newest');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('category');
    nextParams.delete('search');
    setSearchParams(nextParams);
  };

  const activeFilterCount =
    (currentCategory !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0) +
    (selectedAvailability !== 'all' ? 1 : 0) +
    (selectedPriceRange !== 'all' ? 1 : 0) +
    (featuredOnly ? 1 : 0);

  const categoryTitles = {
    scarves: 'Handmade Woolen Scarves',
    gloves: 'Hand-Knitted Woolen Gloves & Mittens',
    beanies: 'Handcrafted Woolen Caps & Beanies',
    mufflers: 'Handmade Woolen Mufflers',
    socks: 'Hand-Knitted Woolen Bed & Lounge Socks',
    other: 'Bespoke Woolen Handcrafts & Accessories',
  };

  const pageTitle =
    currentCategory !== 'all' && categoryTitles[currentCategory]
      ? `${categoryTitles[currentCategory]} | Gurjeet's Handcraft`
      : "Handmade Woolen Collection | Gurjeet's Handcraft";

  const pageDesc =
    currentCategory !== 'all' && categoryTitles[currentCategory]
      ? `Browse authentic ${categoryTitles[currentCategory].toLowerCase()} personally hand-crafted by Gurjeet using pure merino and natural winter wool.`
      : 'Explore authentic handmade woolen scarves, beanies, caps, gloves, and mufflers personally made by Gurjeet with wooden needles and crochet hooks.';

  return (
    <div className="space-y-10 sm:space-y-14">
      <SEO
        title={pageTitle}
        description={pageDesc}
        keywords={[
          'handmade woolen shop',
          'buy pure wool scarf',
          'hand-knitted beanie cap',
          'handmade woolen gloves',
          'artisan crochet muffler',
          'slow fashion winter wool',
          currentCategory !== 'all' ? currentCategory : 'all woolen creations',
        ]}
        canonical={`/shop${currentCategory !== 'all' ? `?category=${currentCategory}` : ''}`}
        ogType="website"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://gurjeetshandcraft.com/',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Shop',
              item: 'https://gurjeetshandcraft.com/shop',
            },
          ],
        }}
      />

      {/* 1. Page Header & Artisan Intro */}
      <div className="border-b border-artisan-heather/80 pb-8 space-y-3">
        <div className="inline-flex items-center gap-2">
          <Badge variant="terracotta">Artisan Woolen Catalog</Badge>
          <span className="text-xs text-artisan-softBrown font-medium">
            &bull; Handcrafted by Gurjeet
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-artisan-earthBrown tracking-tight">
              Handmade Woolen Collection
            </h1>
            <p className="text-sm sm:text-base text-artisan-softBrown max-w-2xl mt-1.5 leading-relaxed">
              Every single piece is personally made by Gurjeet with wooden knitting needles and crochet hooks. Explore ready-to-ship pieces or request custom colors and bespoke dimensions.
            </p>
          </div>

          <div className="text-xs text-artisan-softBrown font-medium bg-artisan-cream px-4 py-2 rounded-2xl border border-artisan-heather self-start md:self-auto">
            {loading ? (
              <span>Checking studio collection...</span>
            ) : (
              <span>
                Showing <strong className="text-artisan-earthBrown">{products.length}</strong> {products.length === 1 ? 'creation' : 'creations'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Primary Category Filter Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-artisan-softBrown font-semibold">
            Select Category
          </span>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-artisan-terracotta hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isActive = currentCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-200 tap-target ${
                  isActive
                    ? 'bg-artisan-earthBrown text-artisan-ivory shadow-subtle'
                    : 'bg-artisan-cream text-artisan-earthBrown hover:bg-artisan-sandstone border border-artisan-heather'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Search & Refinement Bar */}
      <div className="rounded-3xl bg-artisan-cream/70 border border-artisan-heather p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
          {/* Search Input Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-artisan-softBrown absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, wool, or technique..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs sm:text-sm text-artisan-earthBrown placeholder:text-artisan-softBrown/70 focus:outline-none focus:border-artisan-terracotta transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-artisan-softBrown hover:text-artisan-earthBrown"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Availability Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs font-medium text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta"
              aria-label="Filter by Availability"
            >
              <option value="all">All Availability</option>
              <option value="available">Available (Ready)</option>
              <option value="limited">Limited Stock</option>
              <option value="made-to-order">Made to Order</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          {/* Price Range Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs font-medium text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta"
              aria-label="Filter by Price"
            >
              <option value="all">All Prices</option>
              <option value="under-750">Under ₹750</option>
              <option value="750-1200">₹750 – ₹1,200</option>
              <option value="1200-1800">₹1,200 – ₹1,800</option>
              <option value="above-1800">Above ₹1,800</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-artisan-ivory border border-artisan-heather text-xs font-medium text-artisan-earthBrown focus:outline-none focus:border-artisan-terracotta"
                aria-label="Sort creations"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="featured">Featured First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Featured Only Toggle & Active Tags Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-artisan-heather/60 text-xs">
          {/* Featured Pill */}
          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-artisan-earthBrown font-medium">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="rounded border-artisan-heather text-artisan-terracotta focus:ring-artisan-terracotta/40"
            />
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-artisan-terracotta" />
              <span>Show Featured Pieces Only</span>
            </span>
          </label>

          {/* Active Filters Indicators */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 text-artisan-softBrown">
              <span>{activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}</span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="font-semibold text-artisan-terracotta hover:underline ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Products Grid Section with Skeletons and States */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          <ProductCardSkeleton count={8} />
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to Load Studio Catalog"
          message={error}
          onRetry={fetchCatalog}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="No Woolen Items Match Your Filters"
          description="Try adjusting your category, price range, or search keywords. You can also request a custom piece hand-crafted to your preferred size and color."
          actionLabel="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      )}

      {/* 5. Bespoke Custom Orders Prompt Banner */}
      <div className="rounded-3xl bg-artisan-cream border border-artisan-heather p-8 sm:p-12 shadow-cozy text-center max-w-3xl mx-auto space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-artisan-ivory border border-artisan-heather flex items-center justify-center text-2xl">
          🧶
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-artisan-earthBrown">
          Don't see your preferred size or color?
        </h3>
        <p className="text-xs sm:text-sm text-artisan-softBrown max-w-xl mx-auto leading-relaxed">
          Every winter wardrobe is personal. Gurjeet welcomes custom requests for tailored lengths, head circumference sizing, and bespoke pure wool colors.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/custom-orders">
            <Button size="md">Request a Custom Order</Button>
          </Link>
          <a
            href={BUSINESS_CONFIG.createWhatsAppUrl(
              'Hello Gurjeet, I am browsing your Shop and would like to ask about a custom handmade woolen order!'
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#25D366]/10 text-artisan-earthBrown text-xs font-semibold border border-[#25D366]/40 hover:bg-[#25D366]/20 transition tap-target"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

export default ShopPage;
