# README

This is the dispatch web client for the Region Dispatch System. It is built with Next.js and intended to be configured per deployment (domain/database) while keeping a single codebase.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Runtime configuration (domains)

The `config/runtime.ts` file defines environment-aware settings so the same build can serve different domains. It ships with default values for `local`, `staging`, and `production`, and can be overridden via environment variables.

### Required environment variables

- `NEXT_PUBLIC_APP_ENV` — one of `local`, `staging`, `production`; selects the config block.
- `NEXT_PUBLIC_SITE_DOMAIN` — public-facing domain for links and host checks.

### Local setup

Create `.env.local` in `apps/web`:

```env
NEXT_PUBLIC_APP_ENV=local
NEXT_PUBLIC_SITE_DOMAIN=localhost:3000
```

Run `npm run dev` and the app will use the `local` config block with the overrides above.

### Vercel deployment pattern

1. In the Vercel project, add separate Environment Variables for `Preview` and `Production`:
   - Preview (maps to `staging`): set `NEXT_PUBLIC_APP_ENV=staging` and the staging domain.
   - Production: set `NEXT_PUBLIC_APP_ENV=production` and the production domain.
2. Attach the corresponding domains in the Vercel dashboard. No code changes are required; the runtime config reads from the environment.
3. If you add new environments, extend `config/runtime.ts` with another block and set `NEXT_PUBLIC_APP_ENV` accordingly.

### Using the config in code

Import `runtimeConfig` wherever you need environment-aware values. API calls should use same-origin routes. Example:

```ts
import { runtimeConfig } from "../config/runtime";

async function fetchDispatches() {
  const res = await fetch("/api/dispatches");
  if (!res.ok) throw new Error("Failed to load dispatches");
  return res.json();
}
```
