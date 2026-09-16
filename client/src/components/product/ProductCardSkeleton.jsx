import React from 'react';

/**
 * High-fidelity Loading Skeleton for Product Cards
 * Eliminates layout shift during catalog browsing.
 */
export const ProductCardSkeleton = ({ count = 1 }) => {
  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col justify-between rounded-3xl bg-artisan-cream/90 border border-artisan-heather/80 p-5 sm:p-6 space-y-4 animate-pulse shadow-subtle"
          aria-hidden="true"
        >
          {/* Badges Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="h-5 w-20 bg-artisan-sandstone/70 rounded-full" />
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 bg-artisan-sandstone/70 rounded-full" />
              <div className="w-7 h-7 rounded-full bg-artisan-sandstone/70" />
            </div>
          </div>

          {/* Image Placeholder */}
          <div className="w-full aspect-[4/3] rounded-2xl bg-artisan-sandstone/60" />

          {/* Title & Metadata */}
          <div className="space-y-2.5">
            <div className="h-5 w-4/5 bg-artisan-sandstone/80 rounded-md" />
            <div className="h-3 w-full bg-artisan-sandstone/50 rounded" />
            <div className="h-3 w-3/5 bg-artisan-sandstone/50 rounded" />
          </div>

          {/* Pricing & Stock */}
          <div className="pt-3 border-t border-artisan-heather/60 flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-6 w-20 bg-artisan-sandstone/80 rounded-md" />
              <div className="h-3 w-16 bg-artisan-sandstone/40 rounded" />
            </div>
            <div className="h-8 w-24 bg-artisan-sandstone/60 rounded-xl" />
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductCardSkeleton;
