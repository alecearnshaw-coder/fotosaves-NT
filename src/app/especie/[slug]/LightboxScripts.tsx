'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function LightboxScripts() {
  useEffect(() => {
    // Initialize lightbox after scripts load
    const initLightbox = () => {
      // @ts-expect-error - jQuery and lightbox are loaded globally
      if (typeof window !== 'undefined' && window.jQuery && window.jQuery.fn.lightBox) {
        // @ts-expect-error - jQuery is loaded globally
        window.jQuery('a[rel^="lightbox"]').lightBox();
      }
    };

    // Check if already loaded
    // @ts-expect-error - jQuery is loaded globally
    if (typeof window !== 'undefined' && window.jQuery) {
      // Wait a bit for lightbox plugin to be ready
      setTimeout(initLightbox, 500);
    }
  }, []);

  return (
    <>
      <Script 
        src="/lightbox/js/jquery-1.7.2.min.js" 
        strategy="beforeInteractive"
        onLoad={() => {
          console.log('jQuery loaded');
        }}
      />
      <Script 
        src="/lightbox/js/jquery-ui-1.8.18.custom.min.js" 
        strategy="afterInteractive"
      />
      <Script 
        src="/lightbox/js/jquery.smooth-scroll.min.js" 
        strategy="afterInteractive"
      />
      <Script 
        src="/lightbox/js/lightbox.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Lightbox loaded');
          // @ts-expect-error - jQuery and lightbox are loaded globally
          if (typeof window !== 'undefined' && window.jQuery && window.jQuery.fn.lightBox) {
            // @ts-expect-error - jQuery is loaded globally
            window.jQuery('a[rel^="lightbox"]').lightBox();
          }
        }}
      />
    </>
  );
}

