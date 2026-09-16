import React from 'react';
import { motion } from 'framer-motion';
import ArtisanBanner from './ArtisanBanner';
import Navbar from './Navbar';
import Footer from './Footer';

export const PageWrapper = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-artisan-ivory text-artisan-earthBrown font-sans selection:bg-artisan-warmBeige selection:text-artisan-earthBrown">
      <ArtisanBanner />
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
};

export default PageWrapper;
