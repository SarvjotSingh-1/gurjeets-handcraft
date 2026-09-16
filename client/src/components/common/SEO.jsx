import { useEffect } from 'react';

const DEFAULT_TITLE = "Gurjeet's Handcraft | Handmade Woolen Artisan Studio";
const DEFAULT_DESCRIPTION =
  "Authentic handmade woolen scarves, beanies, gloves, and mufflers individually hand-knitted and crocheted with love by Gurjeet using pure merino and highland wool.";
const DEFAULT_IMAGE = '/assets/yarn-icon.svg';
const SITE_NAME = "Gurjeet's Handcraft";
const SITE_URL = 'https://gurjeetshandcraft.com';

/**
 * Lightweight, zero-dependency Head & SEO manager
 * Safely manipulates title, meta tags, canonical link, and JSON-LD schema with cleanup.
 */
export const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  noindex = false,
  structuredData,
}) => {
  useEffect(() => {
    // 1. Update Title
    const formattedTitle = title
      ? title.includes("Gurjeet's Handcraft")
        ? title
        : `${title} | ${SITE_NAME}`
      : DEFAULT_TITLE;

    document.title = formattedTitle;

    // Helper to set or create meta tag
    const setMetaTag = (attribute, attrValue, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attribute}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attribute, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);

    if (keywords) {
      const kwString = Array.isArray(keywords) ? keywords.join(', ') : keywords;
      setMetaTag('name', 'keywords', kwString);
    }

    if (noindex) {
      setMetaTag('name', 'robots', 'noindex, follow');
    } else {
      setMetaTag('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large');
    }

    // 3. Canonical URL
    const currentOrigin =
      typeof window !== 'undefined' ? window.location.origin : SITE_URL;
    const currentPath =
      typeof window !== 'undefined' ? window.location.pathname : '/';
    const canonicalUrl = canonical
      ? canonical.startsWith('http')
        ? canonical
        : `${currentOrigin}${canonical}`
      : `${currentOrigin}${currentPath}`;

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 4. Open Graph Meta Tags
    const fullImageUrl = ogImage.startsWith('http')
      ? ogImage
      : `${currentOrigin}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;

    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', fullImageUrl);
    setMetaTag('property', 'og:site_name', SITE_NAME);

    // 5. Twitter Card Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', fullImageUrl);

    // 6. Structured Data (Schema.org JSON-LD)
    const schemaId = 'artisan-schema-jsonld';
    let scriptTag = document.getElementById(schemaId);

    if (structuredData) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = schemaId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    // Teardown: Remove dynamic schema script if component unmounts
    return () => {
      const existingScript = document.getElementById(schemaId);
      if (existingScript && !structuredData) {
        existingScript.remove();
      }
    };
  }, [
    title,
    description,
    keywords,
    canonical,
    ogType,
    ogImage,
    noindex,
    structuredData,
  ]);

  return null;
};

export default SEO;
