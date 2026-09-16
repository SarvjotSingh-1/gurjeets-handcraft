import React from 'react';
import Button from './Button';
import { AlertCircle, Phone, MessageCircle } from 'lucide-react';
import { BUSINESS_CONFIG } from '../../config/business';

/**
 * Reusable Error State Display
 */
export const ErrorState = ({
  title = 'Unable to Load Content',
  message = 'We encountered an unexpected issue while fetching details from the studio.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`p-8 sm:p-10 text-center rounded-3xl bg-artisan-cream border border-red-200/60 max-w-md mx-auto space-y-4 shadow-subtle ${className}`}
    >
      <div className="w-12 h-12 mx-auto rounded-full bg-red-50 text-red-700 flex items-center justify-center">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="font-serif text-lg font-bold text-artisan-espresso">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-artisan-taupe leading-relaxed">
          {message}
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
        {onRetry && (
          <Button size="sm" onClick={onRetry}>
            Try Again
          </Button>
        )}
        <a
          href={BUSINESS_CONFIG.whatsappBaseUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="secondary" size="sm" className="w-full gap-1.5 text-xs">
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" /> Ask Gurjeet
          </Button>
        </a>
      </div>
    </div>
  );
};

export default ErrorState;
