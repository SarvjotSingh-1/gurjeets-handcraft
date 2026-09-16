import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import productService from '../../api/productService';

export const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const quickTags = ['Scarves', 'Gloves', 'Beanies', 'Mufflers', 'Socks'];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle live search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await productService.getProducts({ search: query.trim(), limit: 8 });
        setResults(res.products || []);
      } catch (err) {
        console.warn('Search query error:', err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-artisan-earthBrown/50 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl rounded-3xl bg-artisan-ivory border border-artisan-heather p-6 sm:p-8 shadow-card z-10 space-y-6"
            role="dialog"
            aria-modal="true"
            aria-label="Search handmade woolen collection"
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center border-b border-artisan-heather/80 pb-3">
              <Search className="w-5 h-5 text-artisan-softBrown absolute left-1" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search scarves, beanies, gloves, mufflers..."
                className="w-full pl-9 pr-8 py-2 bg-transparent text-artisan-earthBrown text-base placeholder:text-artisan-softBrown/70 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-full text-artisan-softBrown hover:text-artisan-earthBrown transition"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Suggestion Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-artisan-softBrown font-semibold mr-1">
                Suggested:
              </span>
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(tag)}
                  className="px-3 py-1 rounded-full text-xs bg-artisan-cream border border-artisan-heather text-artisan-earthBrown hover:bg-artisan-sandstone transition"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Live Search Results */}
            <div className="max-h-80 overflow-y-auto space-y-2">
              {loading ? (
                <p className="text-xs text-center text-artisan-softBrown py-6 italic">
                  Searching handmade atelier...
                </p>
              ) : query && results.length === 0 ? (
                <div className="text-center py-8 space-y-1">
                  <p className="font-serif text-sm font-semibold text-artisan-earthBrown">
                    No creations found for "{query}"
                  </p>
                  <p className="text-xs text-artisan-softBrown">
                    Try searching for scarves, gloves, beanies, or request a custom order.
                  </p>
                </div>
              ) : (
                results.map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-3 rounded-2xl bg-artisan-cream/60 hover:bg-artisan-cream border border-transparent hover:border-artisan-heather transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-artisan-sandstone/60 flex items-center justify-center text-lg flex-shrink-0">
                        🧶
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-semibold text-artisan-earthBrown group-hover:text-artisan-terracotta transition line-clamp-1">
                          {product.title}
                        </h4>
                        <p className="text-[11px] text-artisan-softBrown">
                          {product.craftTechnique} &bull; {product.material}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-artisan-terracotta">
                        ₹{product.price?.toLocaleString('en-IN')}
                      </span>
                      <ArrowRight className="w-4 h-4 text-artisan-softBrown group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Dialog Footer */}
            <div className="pt-2 border-t border-artisan-heather/70 flex items-center justify-between text-xs text-artisan-softBrown">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-artisan-cream border border-artisan-heather font-mono text-[10px]">ESC</kbd> to close</span>
              <button
                type="button"
                onClick={onClose}
                className="font-semibold text-artisan-terracotta hover:underline"
              >
                Close Search
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
