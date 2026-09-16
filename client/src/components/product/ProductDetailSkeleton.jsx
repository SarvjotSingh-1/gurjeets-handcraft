import React from 'react';

/**
 * Editorial Loading Skeleton for Product Details Page
 * Matches two-column artisan product layout to eliminate layout shift.
 */
export const ProductDetailSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 animate-pulse" aria-hidden="true">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 bg-artisan-sandstone/60 rounded" />
        <span className="text-artisan-heather">/</span>
        <div className="h-4 w-20 bg-artisan-sandstone/60 rounded" />
        <span className="text-artisan-heather">/</span>
        <div className="h-4 w-32 bg-artisan-sandstone/40 rounded" />
      </div>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery Skeleton */}
        <div className="lg:col-span-7 space-y-4">
          <div className="w-full aspect-[4/3] sm:aspect-[1/1] rounded-3xl bg-artisan-sandstone/60" />
          <div className="flex gap-3">
            <div className="w-20 h-20 rounded-2xl bg-artisan-sandstone/70" />
            <div className="w-20 h-20 rounded-2xl bg-artisan-sandstone/50" />
            <div className="w-20 h-20 rounded-2xl bg-artisan-sandstone/40" />
          </div>
        </div>

        {/* Right Column: Details & Actions Skeleton */}
        <div className="lg:col-span-5 space-y-6">
          {/* Badges */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-24 bg-artisan-sandstone/70 rounded-full" />
            <div className="h-6 w-28 bg-artisan-sandstone/60 rounded-full" />
          </div>

          {/* Title & Price */}
          <div className="space-y-3">
            <div className="h-8 w-4/5 bg-artisan-sandstone/80 rounded-lg" />
            <div className="h-7 w-28 bg-artisan-sandstone/70 rounded-md" />
          </div>

          {/* Description Paragraphs */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-artisan-sandstone/50 rounded" />
            <div className="h-4 w-11/12 bg-artisan-sandstone/50 rounded" />
            <div className="h-4 w-3/4 bg-artisan-sandstone/40 rounded" />
          </div>

          {/* Color Options */}
          <div className="space-y-2.5 pt-2">
            <div className="h-4 w-28 bg-artisan-sandstone/60 rounded" />
            <div className="flex gap-2">
              <div className="h-9 w-24 bg-artisan-sandstone/50 rounded-xl" />
              <div className="h-9 w-24 bg-artisan-sandstone/40 rounded-xl" />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t border-artisan-heather/70">
            <div className="h-12 w-full bg-artisan-sandstone/80 rounded-2xl" />
            <div className="flex gap-3">
              <div className="h-11 flex-1 bg-artisan-sandstone/60 rounded-2xl" />
              <div className="h-11 w-14 bg-artisan-sandstone/60 rounded-2xl" />
            </div>
          </div>

          {/* Artisan Guarantees */}
          <div className="p-4 rounded-2xl bg-artisan-cream/80 border border-artisan-heather/60 space-y-3">
            <div className="h-4 w-40 bg-artisan-sandstone/60 rounded" />
            <div className="h-4 w-48 bg-artisan-sandstone/50 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
