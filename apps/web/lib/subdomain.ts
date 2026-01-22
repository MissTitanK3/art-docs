import { runtimeConfig } from '@/config/runtime';
import type { Subdomain } from '@/config/runtime';

/**
 * Extracts subdomain from hostname
 * Examples:
 * - localhost:3000 → null (no subdomain for local dev)
 * - www.dispatch.example.org → www
 * - api.dispatch.example.org → api
 * - dispatch.example.org → null (root domain)
 */
export function extractSubdomain(hostname: string): Subdomain | null {
  // Remove port if present
  const host = hostname.split(':')[0];

  // For localhost, always return null
  if (host === 'localhost' || !host) {
    return null;
  }

  const parts = host.split('.');

  // Root domain or invalid format
  if (parts.length <= 2) {
    return null;
  }

  const potentialSubdomain = parts[0] as Subdomain;

  // Validate against allowed subdomains
  if (runtimeConfig.allowedSubdomains.includes(potentialSubdomain)) {
    return potentialSubdomain;
  }

  return null;
}

/**
 * Generates subdomain URL for a given subdomain
 */
export function getSubdomainUrl(subdomain: Subdomain, pathname: string = '/'): string {
  const domain = runtimeConfig.siteDomain;
  const isLocal = domain.includes('localhost');

  if (isLocal) {
    // For localhost, use query param or path-based routing
    // Example: localhost:3000?subdomain=api
    return `${pathname}?subdomain=${subdomain}`;
  }

  // Extract base domain (e.g., dispatch.example.org)
  const baseDomain = domain.includes(':') ? domain.split(':')[0] : domain;

  return `https://${subdomain}.${baseDomain}${pathname}`;
}

/**
 * Get current effective subdomain for the application
 * Falls back to default if not detected
 */
export function getCurrentSubdomain(hostname?: string): Subdomain {
  if (!hostname) {
    return runtimeConfig.defaultSubdomain;
  }

  const detected = extractSubdomain(hostname);
  return detected ?? runtimeConfig.defaultSubdomain;
}
