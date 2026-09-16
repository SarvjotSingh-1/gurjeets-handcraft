import React from 'react';
import Container from './Container';

/**
 * Reusable Content Section with artisan background tones and typography
 */
export const Section = ({
  children,
  badge,
  title,
  subtitle,
  bg = 'transparent',
  size = 'default',
  className = '',
  containerClassName = '',
  ...props
}) => {
  const bgStyles = {
    transparent: 'bg-transparent',
    ivory: 'bg-artisan-ivory',
    cream: 'bg-artisan-cream border-y border-artisan-heather/50',
    beige: 'bg-artisan-beige border-y border-artisan-heather/60',
    sandstone: 'bg-artisan-sandstone/40 border-y border-artisan-heather/60',
  };

  return (
    <section className={`py-12 sm:py-16 lg:py-20 ${bgStyles[bg] || bgStyles.transparent} ${className}`} {...props}>
      <Container size={size} className={containerClassName}>
        {(badge || title || subtitle) && (
          <div className="mb-8 sm:mb-12 text-center max-w-2xl mx-auto space-y-3">
            {badge && (
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-artisan-terracotta bg-artisan-terracotta/10 px-3 py-1 rounded-full border border-artisan-terracotta/20">
                {badge}
              </span>
            )}
            {title && (
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-artisan-espresso tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm sm:text-base text-artisan-taupe leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
};

export default Section;
