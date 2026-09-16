import React from 'react';

/**
 * Responsive Page/Content Container
 * Keeps content centered with consistent artisan breathing room
 */
export const Container = ({
  children,
  size = 'default',
  className = '',
  ...props
}) => {
  const sizes = {
    narrow: 'max-w-4xl',
    default: 'max-w-7xl',
    wide: 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${sizes[size] || sizes.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;
