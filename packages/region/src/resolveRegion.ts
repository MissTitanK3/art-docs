export const DEFAULT_REGION = 'DEFAULT';

export function resolveRegion({
  host,
  headerRegion,
  fallbackRegion = DEFAULT_REGION,
}: {
  host?: string | null;
  headerRegion?: string | null;
  fallbackRegion?: string;
}): string {
  const cleanHost = host?.split(':')[0];
  if (cleanHost && cleanHost.includes('.')) {
    const parts = cleanHost.split('.').filter(Boolean);
    if (parts.length > 2) {
      const subdomain = parts[0];
      if (subdomain) {
        return subdomain.toUpperCase();
      }
    }
  }

  if (headerRegion) {
    return headerRegion.toUpperCase();
  }

  return fallbackRegion.toUpperCase();
}
