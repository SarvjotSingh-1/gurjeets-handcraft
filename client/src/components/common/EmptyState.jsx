import React from 'react';
import Button from './Button';

/**
 * Reusable Empty State Display
 */
export const EmptyState = ({
  icon,
  title = 'No Items Found',
  description = 'There are no handmade pieces to display at this moment.',
  actionLabel,
  onAction,
  actionLink,
  className = '',
}) => {
  return (
    <div
      className={`p-10 sm:p-14 text-center rounded-3xl bg-artisan-cream/70 border border-artisan-heather max-w-md mx-auto space-y-4 shadow-subtle ${className}`}
    >
      <div className="w-14 h-14 mx-auto rounded-2xl bg-artisan-sandstone/60 flex items-center justify-center text-2xl text-artisan-terracotta">
        {icon || '🧶'}
      </div>
      <div className="space-y-1.5">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-artisan-espresso">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-artisan-taupe leading-relaxed">
          {description}
        </p>
      </div>

      {(actionLabel && (onAction || actionLink)) && (
        <div className="pt-2">
          {actionLink ? (
            <a href={actionLink}>
              <Button size="sm">{actionLabel}</Button>
            </a>
          ) : (
            <Button size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
