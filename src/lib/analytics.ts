/**
 * Google Analytics 4 (GA4) tracking module.
 * 
 * Reads measurement ID from VITE_GA4_ID env var.
 * Only loads when the env var is set (zero overhead otherwise).
 * 
 * Usage: Call initGA4() once in main.tsx, then trackPageView() on route changes.
 */

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA4_ID = import.meta.env.VITE_GA4_ID as string | undefined;

let initialized = false;

/** Load gtag.js and configure GA4 */
export function initGA4(): void {
  if (!GA4_ID || initialized) return;
  initialized = true;

  // Inject gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer + gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA4_ID, {
    send_page_view: false, // We'll send manually on route changes
  });
}

/** Track a page view (call on every route change) */
export function trackPageView(path?: string): void {
  if (!GA4_ID || !initialized) return;
  window.gtag('event', 'page_view', {
    page_path: path ?? window.location.pathname,
    page_title: document.title,
  });
}

/** Track a custom event */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (!GA4_ID || !initialized) return;
  window.gtag('event', name, params);
}

/** Track a lead/conversion event */
export function trackLead(source: string): void {
  trackEvent('generate_lead', { event_category: 'engagement', event_label: source });
}
