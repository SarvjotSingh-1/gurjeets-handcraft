import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, ShoppingBag, Home, MessageCircle, ArrowLeft } from 'lucide-react';
import Container from '../../components/common/Container';
import Button from '../../components/common/Button';
import SEO from '../../components/common/SEO';

export const NotFoundPage = () => {
  return (
    <Container className="py-16 sm:py-24 text-center">
      <SEO
        title="Page Not Found | Gurjeet's Handcraft"
        description="The requested page could not be located in Gurjeet's Handcraft studio catalog."
        noindex={true}
      />
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg mx-auto space-y-6"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-artisan-cream border border-artisan-heather flex items-center justify-center text-artisan-terracotta shadow-card">
          <Compass className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-artisan-terracotta font-semibold">
            Error 404 &bull; Missing Page
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-artisan-earthBrown">
            Creation or Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-artisan-softBrown leading-relaxed">
            The page or handcrafted piece you are looking for might have been moved, renamed, or is no longer in Gurjeet's active studio catalog.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/shop" className="w-full sm:w-auto">
            <Button size="md" className="w-full justify-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Handmade Shop</span>
            </Button>
          </Link>

          <Link to="/" className="w-full sm:w-auto">
            <Button variant="secondary" size="md" className="w-full justify-center gap-2">
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Button>
          </Link>
        </div>

        <div className="pt-6 border-t border-artisan-heather/60 text-xs text-artisan-softBrown">
          <span>Need help finding a specific design? </span>
          <Link to="/contact" className="font-semibold text-artisan-terracotta hover:underline">
            Contact Gurjeet directly
          </Link>
        </div>
      </motion.div>
    </Container>
  );
};

export default NotFoundPage;
