/**
 * Google Analytics tracking utilities
 * Initialize GA4 and track page views and custom events
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Initialize Google Analytics with the provided measurement ID
 * Should be called once on app load
 */
export function initializeGA(measurementId: string | undefined): void {
  if (!measurementId || typeof window === 'undefined') {
    console.log('GA initialization skipped: no measurement ID provided');
    return;
  }

  // Load the GA script if not already loaded
  if (!window.gtag) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag function
    (window as any).dataLayer = (window as any).dataLayer || [];
    window.gtag = function (...args: unknown[]) {
      (window as any).dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
  }

  // Configure GA with the measurement ID
  if (window.gtag) {
    window.gtag('config', measurementId, {
      page_path: window.location.pathname,
    });
  }
}

/**
 * Track a page view
 * Call this when navigation occurs
 * Note: GA is already configured in initializeGA(), this just updates the page context
 */
export function trackPageView(path: string, title: string): void {
  if (!window.gtag) {
    console.log('GA not initialized, skipping page view');
    return;
  }

  // Update GA configuration with new page path and title
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
  });
}

/**
 * Track a custom event
 * @param eventName - Name of the event (e.g., 'export_appointment', 'import_data')
 * @param eventParams - Additional parameters to send with the event
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
): void {
  if (!window.gtag) {
    console.log('GA not initialized, skipping event', eventName);
    return;
  }

  window.gtag('event', eventName, eventParams || {});
}

/**
 * Track a custom event with enhanced error handling and logging
 * Wrapper for trackEvent with better development experience
 */
export function trackEventSafe(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
): void {
  try {
    trackEvent(eventName, eventParams);
    if (process.env.NODE_ENV === 'development') {
      console.log(`GA Event tracked: ${eventName}`, eventParams);
    }
  } catch (error) {
    console.error(`Failed to track GA event: ${eventName}`, error);
  }
}
