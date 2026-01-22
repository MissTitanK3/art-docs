# Multi-Subdomain Setup for apps/web

This document describes how `apps/web` is configured to support multiple subdomains for Sprint 0 deployment across prod plus temporary test regions (rt1, rt2).

## Overview

The web app now supports routing through multiple subdomains:

- **www** - Main web application (default)
- **api** - API endpoints (future)
- **admin** - Admin panel (future)
- **docs** - Documentation (future)

## Configuration

### Environment Variables

```bash
NEXT_PUBLIC_APP_ENV=production        # local, staging, or production
NEXT_PUBLIC_SITE_DOMAIN=alwaysreadytools.org
```

### Runtime Configuration

Runtime configuration is defined in [`config/runtime.ts`](./config/runtime.ts) and includes:

```typescript
{
  appEnv: 'production',
  siteDomain: 'alwaysreadytools.org',
  allowedSubdomains: ['www', 'api', 'admin', 'docs', 'rt1', 'rt2'],
  defaultSubdomain: 'www'
}
```

## Subdomain Routing

### Production/Staging (DNS-based)

For production and staging environments, subdomain routing uses DNS:

```bash
www.alwaysreadytools.org     → Main app
api.alwaysreadytools.org     → API service
admin.alwaysreadytools.org   → Admin panel
docs.alwaysreadytools.org    → Documentation
```

All subdomains point to the same Next.js instance. The app detects the subdomain from the `Host` header and routes accordingly.

### Local Development (Query Parameter)

For local development (`localhost:3000`), subdomain routing uses query parameters:

```bash
http://localhost:3000/?subdomain=www    → Main app
http://localhost:3000/?subdomain=api    → API service
http://localhost:3000/?subdomain=admin  → Admin panel
http://localhost:3000/?subdomain=docs   → Documentation
```

## Usage

### Server-Side: Detecting Subdomain

Use the `extractSubdomain()` utility in server components:

```typescript
import { extractSubdomain, getCurrentSubdomain } from '@/lib/subdomain';

// In a server component
const subdomain = getCurrentSubdomain(request.headers.get('host'));
```

### Client-Side: Using the Hook

Use the `useSubdomain()` hook in client components:

```typescript
'use client';

import { useSubdomain } from '@/lib/hooks/useSubdomain';

export function MyComponent() {
  const subdomain = useSubdomain();
  
  return <p>You are on the {subdomain} subdomain</p>;
}
```

### Generating Subdomain URLs

Use `getSubdomainUrl()` to generate URLs for different subdomains:

```typescript
import { getSubdomainUrl } from '@/lib/subdomain';

// Generates appropriate URL based on environment
const apiUrl = getSubdomainUrl('api', '/health');
// Production: https://api.alwaysreadytools.org/health
// Local: /?subdomain=api (then fetch from /health)
```

## Adding New Subdomains

To add a new subdomain:

1. Update the `Subdomain` type in [`config/runtime.ts`](./config/runtime.ts):

   ```typescript
   export type Subdomain = 'www' | 'api' | 'admin' | 'docs' | 'newsubdomain';
   ```

2. Add to allowed subdomains in the config defaults:

   ```typescript
   allowedSubdomains: ['www', 'api', 'admin', 'docs', 'newsubdomain'],
   ```

3. Create subdomain-specific routes using Next.js routing (future implementation).

## DNS Configuration (Deployment)

For production deployments, configure DNS wildcard:

```dns
*.alwaysreadytools.org  CNAME  app.production.alwaysreadytools.org
www.alwaysreadytools.org CNAME  app.production.alwaysreadytools.org
```

For region deployments (temporary test subdomains):

```dns
*.rt1.alwaysreadytools.org  CNAME  app.rt1.alwaysreadytools.org
www.rt1.alwaysreadytools.org CNAME  app.rt1.alwaysreadytools.org

*.rt2.alwaysreadytools.org  CNAME  app.rt2.alwaysreadytools.org
www.rt2.alwaysreadytools.org CNAME  app.rt2.alwaysreadytools.org
```

### Vercel Setup (recommended)

1. **Create project**: Import the monorepo in Vercel and select `apps/web` as the project.

2. **Environment variables** (Project → Settings → Environment Variables)

- Production: `NEXT_PUBLIC_APP_ENV=production`, `NEXT_PUBLIC_SITE_DOMAIN=alwaysreadytools.org`
- Preview: `NEXT_PUBLIC_APP_ENV=staging`, `NEXT_PUBLIC_SITE_DOMAIN=alwaysreadytools.org`
- Development: optional, usually handled locally.

1. **Custom domains** (Project → Settings → Domains)

- Add `www.alwaysreadytools.org`.
- Add temporary test domains `rt1.alwaysreadytools.org` and `rt2.alwaysreadytools.org`.
- For each, let Vercel provide the CNAME target (for example `cname.vercel-dns.com`) and configure those records at your DNS provider.

1. **Edge/SSR cache**

- No special cache rules needed; subdomain detection uses the `Host` header automatically.

1. **Smoke test**

- After deployment, visit `https://rt1.alwaysreadytools.org` and `https://rt2.alwaysreadytools.org` to confirm the page shows the detected subdomain.

## Testing Subdomains Locally

### Using /etc/hosts

```bash
# Add to /etc/hosts
127.0.0.1 www.alwaysreadytools.local
127.0.0.1 api.alwaysreadytools.local
127.0.0.1 admin.alwaysreadytools.local
```

Then run:

```bash
NEXT_PUBLIC_SITE_DOMAIN=alwaysreadytools.local npm run dev
```

Visit `http://www.alwaysreadytools.local:3000`

### Using Query Parameters

Simply use the query parameter approach:

```bash
http://localhost:3000/?subdomain=api
http://localhost:3000/?subdomain=admin
```

## Next.js Configuration

The Next.js configuration in [`next.config.js`](./next.config.js) includes:

- **Headers**: Support metadata for subdomain tracking
- **Rewrites**: Optional rewrites for subdomain-based routing
- **Host Matching**: Support for subdomain detection via `has.type: 'host'`

## Region-Specific Deployment

For Sprint 0, subdomain routing combined with environment variables enables:

1. **Environment Detection**: `NEXT_PUBLIC_APP_ENV` differentiates local/staging/production
2. **Region Detection**: Future implementation via `NEXT_PUBLIC_REGION_NAME`
3. **Subdomain Isolation**: Different services accessible via subdomains

Example deployment targets:

```bash
prod:         www.alwaysreadytools.org
prod-region1: rt1.alwaysreadytools.org
prod-region2: rt2.alwaysreadytools.org
```

## Related Files

- [`config/runtime.ts`](./config/runtime.ts) - Runtime configuration
- [`lib/subdomain.ts`](./lib/subdomain.ts) - Subdomain utilities
- [`lib/hooks/useSubdomain.ts`](./lib/hooks/useSubdomain.ts) - Client-side hook
- [`next.config.js`](./next.config.js) - Next.js configuration
- [`app/layout.tsx`](./app/layout.tsx) - Root layout with environment info
- [`app/page.tsx`](./app/page.tsx) - Demo page showing current subdomain
