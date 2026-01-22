# Vercel + Supabase Deployment

## Architecture overview

- Vercel hosts `apps/web` and `apps/docs` as separate projects.
- API logic is served by Next.js route handlers under `apps/web/app/api`.
- Supabase provides Postgres only (one project per region).
- Region is resolved per request (subdomain first, then `X-Region` header, then `DEFAULT`).
- Database connections are created per region and cached per execution context.

## Region to database mapping

Region mapping is defined by environment variables in Vercel:

- `DB_DEFAULT_URL`
- `DB_PNW_URL`
- `DB_NYC_URL`
- `DB_CA_URL`

`packages/db` resolves `DB_${REGION}_URL` first, then falls back to `DB_DEFAULT_URL`.

## Environment variable contract

Set these in the Vercel dashboard (per project, per environment):

- `DB_DEFAULT_URL` (required)
- `DB_PNW_URL` (recommended)
- `DB_NYC_URL` (recommended)
- `DB_CA_URL` (recommended)
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_ENV`
- `NEXT_PUBLIC_SITE_DOMAIN`

No `DATABASE_URL` is used at runtime. Do not set API base URLs in clients; all API calls are same-origin.

## Migration procedure (per region)

Migrations run per region by exporting the region-specific DB URL into `DATABASE_URL`:

```sh
DATABASE_URL=$DB_PNW_URL pnpm --filter @repo/migrations migrate
DATABASE_URL=$DB_NYC_URL pnpm --filter @repo/migrations migrate
DATABASE_URL=$DB_CA_URL pnpm --filter @repo/migrations migrate
```

Use `SHADOW_DATABASE_URL` and `ROOT_DATABASE_URL` as required by the migrations package.

## Rollback strategy

- Roll back the Vercel deployment to the last known good build.
- Roll back database schema by reversing the last migration per region.
- Validate read/write health per region after rollback.

## Notes

Each Supabase project is region-isolated. Cross-region reads/writes are not supported.
