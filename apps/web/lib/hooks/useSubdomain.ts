'use client';

import { useCallback, useEffect, useState } from 'react';
import { extractSubdomain } from '@/lib/subdomain';
import type { Subdomain } from '@/config/runtime';

export function useSubdomain(): Subdomain {
  const [subdomain, setSubdomain] = useState<Subdomain>(() => {
    if (typeof document !== 'undefined') {
      const fromDom = document.body?.dataset?.subdomain as Subdomain | undefined;
      if (fromDom) return fromDom;
    }
    return 'www';
  });

  useEffect(() => {
    // Update subdomain if URL changes
    const params = new URLSearchParams(window.location.search);
    const subParam = params.get('subdomain') as Subdomain | null;

    if (subParam && subParam !== subdomain) {
      setSubdomain(subParam);
      return;
    }

    const detected = extractSubdomain(window.location.hostname);
    if (detected && detected !== subdomain) {
      setSubdomain(detected);
    }
  }, [subdomain]);

  return subdomain;
}

export function useSubdomainUrl() {
  return useCallback((path: string = '/'): string => {
    if (typeof window === 'undefined') {
      return path;
    }

    const params = new URLSearchParams(window.location.search);
    const currentSub = params.get('subdomain');

    if (currentSub) {
      // Maintain subdomain in query param
      const newParams = new URLSearchParams(params);
      return `${path}?${newParams.toString()}`;
    }

    return path;
  }, []);
}
