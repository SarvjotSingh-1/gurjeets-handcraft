import React, { useState } from 'react';

/**
 * High-End Artisan Image Component
 * Ensures NO ugly or generic placeholders ever show.
 * If an image is loading or fails, renders an elegant bespoke craft canvas
 * featuring hand-drawn wool vectors and artisanal textures.
 */
export const ArtisanImage = ({
  src,
  alt = 'Handcrafted woolen piece by Gurjeet',
  aspectRatio = 'aspect-square',
  craftTechnique = 'Hand-Knitted',
  title = '',
  className = '',
  imageClassName = '',
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(!src);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-artisan-cream border border-artisan-heather/50 ${aspectRatio} flex items-center justify-center select-none ${className}`}
    >
      {/* Real Image (if provided and hasn't failed) */}
      {!imageFailed && src && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageFailed(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-artisan ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          } ${imageClassName}`}
          loading="lazy"
        />
      )}

      {/* Elegant Artisan Placeholder (shows while loading OR if image is unavailable) */}
      {(!imageLoaded || imageFailed) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-artisan-cream via-artisan-warmBeige/40 to-artisan-cream">
          {/* Delicate Woven Yarn Motif SVG */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3 flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-artisan-terracotta/70 stroke-current drop-shadow-subtle"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                strokeWidth="2.5"
                strokeDasharray="3 3"
                className="text-artisan-woolHeather"
              />
              <path
                d="M26 44 C38 24 62 24 74 44 C62 64 38 64 26 44 Z"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M24 56 C36 36 64 36 76 56 C64 76 36 76 24 56 Z"
                strokeWidth="2.5"
                className="text-artisan-softBrown"
                strokeLinecap="round"
              />
              <path
                d="M36 24 C56 40 56 64 36 80"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M64 24 C44 40 44 64 64 80"
                strokeWidth="2"
                className="text-artisan-softBrown"
                strokeLinecap="round"
              />
              {/* Wooden Needle Accent */}
              <line
                x1="18"
                y1="82"
                x2="82"
                y2="18"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="text-artisan-softBrown"
              />
              <circle cx="84" cy="16" r="3.5" fill="#944737" />
            </svg>
          </div>

          <span className="text-[10px] uppercase tracking-widest font-sans font-semibold text-artisan-softBrown/80 mb-1">
            {craftTechnique}
          </span>
          {title ? (
            <p className="font-serif text-sm font-semibold text-artisan-earthBrown line-clamp-1 max-w-[85%]">
              {title}
            </p>
          ) : (
            <p className="font-serif italic text-xs text-artisan-softBrown">
              Handmade by Gurjeet
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ArtisanImage;
