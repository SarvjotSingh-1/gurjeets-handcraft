import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]';

  const variants = {
    primary:
      'bg-artisan-terracotta hover:bg-artisan-terracottaDark text-white shadow-sm hover:shadow focus:ring-artisan-terracotta/40',
    secondary:
      'bg-artisan-cream hover:bg-artisan-sandstone text-artisan-espresso border border-artisan-heather focus:ring-artisan-taupe/30',
    outline:
      'bg-transparent border border-artisan-terracotta text-artisan-terracotta hover:bg-artisan-terracotta/10 focus:ring-artisan-terracotta/30',
    ghost:
      'bg-transparent hover:bg-artisan-cream text-artisan-espresso focus:ring-artisan-taupe/20',
    whatsapp:
      'bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-subtle focus:ring-[#25D366]/40',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${
        sizes[size] || sizes.md
      } ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Please wait...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
