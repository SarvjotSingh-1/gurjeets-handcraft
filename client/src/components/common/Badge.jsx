import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const base = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default: 'bg-artisan-cream text-artisan-espresso border border-artisan-heather',
    craft: 'bg-artisan-sandstone/70 text-artisan-espresso border border-artisan-taupe/20',
    terracotta: 'bg-artisan-terracotta/10 text-artisan-terracotta border border-artisan-terracotta/20',
    sage: 'bg-artisan-sage/15 text-artisan-sage border border-artisan-sage/30',
    amber: 'bg-artisan-amber/15 text-artisan-amber border border-artisan-amber/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm',
  };

  return (
    <span
      className={`${base} ${variants[variant] || variants.default} ${
        sizes[size] || sizes.md
      } ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
