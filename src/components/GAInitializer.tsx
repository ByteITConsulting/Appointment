'use client';

import { useEffect } from 'react';
import { initializeGA } from '@/lib/analytics-tracking';

/**
 * Client-side component to initialize Google Analytics
 * Must be used client-side to access process.env and window object
 */
export default function GAInitializer() {
  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (gaId) {
      initializeGA(gaId);
    }
  }, []);

  return null;
}
