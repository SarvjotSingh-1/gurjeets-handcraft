import React from 'react';
import { Heart } from 'lucide-react';

export const ArtisanBanner = () => {
  return (
    <aside aria-label="Announcement" className="bg-artisan-espresso text-artisan-cream py-2 px-4 text-xs tracking-wide">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
        <Heart className="w-3.5 h-3.5 text-artisan-terracotta fill-artisan-terracotta flex-shrink-0" />
        <span>
          <strong>Handmade by Gurjeet</strong> &bull; Every piece individually crocheted & knitted with pure wool.
        </span>
      </div>
    </aside>
  );
};

export default ArtisanBanner;
