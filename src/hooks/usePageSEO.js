import { useEffect } from 'react';

const SITE_URL = 'https://7days-seven.vercel.app';

/**
 * Custom hook to update document title, meta description, canonical URL,
 * and Open Graph / Twitter tags dynamically in React Router SPA.
 */
export function usePageSEO({
  title,
  description,
  canonicalPath = '/',
  robots = 'index, follow'
}) {
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = title;
    }

    // 2. Update Meta Description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);

      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', description);

      let twDesc = document.querySelector('meta[property="twitter:description"]');
      if (twDesc) twDesc.setAttribute('content', description);
    }

    // 3. Update Canonical URL
    const normalizedPath = canonicalPath === '/' ? '' : canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const fullCanonicalUrl = `${SITE_URL}${normalizedPath}`;

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullCanonicalUrl);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', fullCanonicalUrl);

    // 4. Update Open Graph & Twitter Title
    if (title) {
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);

      let twTitle = document.querySelector('meta[property="twitter:title"]');
      if (twTitle) twTitle.setAttribute('content', title);
    }

    // 5. Update Robots
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta && robots) {
      robotsMeta.setAttribute('content', robots);
    }

    // Scroll to top when route SEO is updated (if no hash)
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [title, description, canonicalPath, robots]);
}
