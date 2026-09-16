import React from 'react';

/**
 * Reusable Loading Spinner & Skeleton
 */
export const Loading = ({
  type = 'spinner',
  text = 'Crafting with yarn...',
  size = 'md',
  fullScreen = false,
  className = '',
}) => {
  if (type === 'skeleton') {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-48 bg-artisan-sandstone/50 rounded-2xl"></div>
        <div className="h-4 bg-artisan-sandstone/50 rounded w-3/4"></div>
        <div className="h-3 bg-artisan-sandstone/40 rounded w-1/2"></div>
      </div>
    );
  }

  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizes[size] || sizes.md} rounded-full border-artisan-heather border-t-artisan-terracotta animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="text-xs sm:text-sm font-serif italic text-artisan-taupe">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-artisan-ivory/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="py-12 flex justify-center items-center">{content}</div>;
};

export default Loading;
