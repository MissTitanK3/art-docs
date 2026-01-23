# @repo/db

Vendor-agnostic database client for the monorepo.

## Purpose

This package provides a **database abstraction layer** that allows apps to work with any database provider without vendor lock-in.

### Architecture Goals

- **Apps**: Import from `@repo/db` (never directly from `@supabase/supabase-js` or `pg`)
- **packages/migrations**: Vendor-agnostic SQL documentation for community guidance
- **supabase/**: Local Supabase setup for your team (specific implementation)
- **Deployment**: Choose any database (Supabase, raw PostgreSQL, MySQL, etc.)

## Supported Providers

### Supabase (Default)

Local development and managed Supabase deployments.

**Environment Variables**:

```bash
DB_PROVIDER=supabase  # default, can omit
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

### PostgreSQL (Raw)

Self-hosted or cloud PostgreSQL (e.g., RDS, Neon, Railway).

**Environment Variables**:

```bash
DB_PROVIDER=postgres
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

**Status**: 🚧 Not yet implemented (TODO)

### Future Providers

- MySQL
- MongoDB
- CockroachDB
- PlanetScale
- etc.

## Usage

### Basic Query

```typescript
import { db } from '@repo/db';

// Select data
const { data, error } = await db.from('users').select('*');

// Insert data
await db.from('dispatches').insert({
  title: 'New Dispatch',
  region_id: 'us-west-1'
});

// Update data
await db.from('users').update({ name: 'John' }).eq('id', userId);
```

### Server-Side Operations

```typescript
import { dbServer } from '@repo/db';

// Server actions with elevated privileges
export async function createUser(email: string) {
  const { data, error } = await dbServer.from('users').insert({ email });
  return data;
}
```

### Authentication

```typescript
import { auth } from '@repo/db';

// Sign in
const { data, error } = await auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Get session
const { data: { session } } = await auth.getSession();

// Sign out
await auth.signOut();
```

## Migration from Direct Supabase

### Before (Vendor Lock-in)

```typescript
// ❌ App directly imports Supabase
import { supabase } from '@/lib/supabase-client';

const { data } = await supabase.from('users').select();
```

### After (Vendor-Agnostic)

```typescript
// ✅ App imports from abstraction layer
import { db } from '@repo/db';

const { data } = await db.from('users').select();
```

**Same code works with Supabase OR raw PostgreSQL** - just change environment variables.

## Configuration

### Local Development (Supabase)

1. Start Supabase:

   ```bash
   pnpm dev:infra
   ```

2. Environment variables (`.env.local`):

   ```bash
   DB_PROVIDER=supabase
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase status>
   SUPABASE_SERVICE_ROLE_KEY=<from supabase status>
   ```

3. Use in app:

   ```typescript
   import { db } from '@repo/db';
   ```

### Production (Cloud Supabase)

1. Create Supabase project
2. Set environment variables:

   ```bash
   DB_PROVIDER=supabase
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<project_anon_key>
   SUPABASE_SERVICE_ROLE_KEY=<project_service_key>
   ```

### Production (Self-Hosted PostgreSQL)

1. Deploy PostgreSQL (RDS, Neon, etc.)
2. Set environment variables:

   ```bash
   DB_PROVIDER=postgres
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```

3. **TODO**: Implement PostgreSQL provider in this package

## Architecture

```bash
packages/db/                      # This package
├── src/index.ts                  # Main abstraction layer
└── README.md

packages/migrations/              # Vendor-agnostic documentation
├── migrations/committed/         # SQL migrations (portable)
└── README.md                     # Community guidance

supabase/                         # Your team's local setup
├── config.toml                   # Supabase-specific config
└── migrations/                   # Runtime migrations

apps/web/                         # Consumer app
├── import { db } from '@repo/db' # ✅ Uses abstraction
└── .env.local                    # DB_PROVIDER=supabase
```

**Key Principle**: Apps never import directly from `@supabase/supabase-js` or `pg`. Always go through `@repo/db`.

## Why This Matters

### For Open Source Communities

- `packages/migrations/` contains **portable SQL** that works with any PostgreSQL-compatible database
- No vendor lock-in - communities can use their preferred database
- Documentation guides setup for Supabase, raw Postgres, or others

### For Your Team

- `supabase/` provides **convenient local development** with Supabase CLI
- Production can use cloud Supabase OR self-hosted Postgres
- Same app code works everywhere (environment variables control provider)

### For Apps

- Import from `@repo/db` - one interface
- No code changes when switching providers
- TypeScript autocomplete works regardless of backend

## Adding a New Provider

To add support for MySQL, MongoDB, etc.:

1. Add provider type to `DatabaseProvider`:

   ```typescript
   export type DatabaseProvider = 'supabase' | 'postgres' | 'mysql';
   ```

2. Update `getDatabaseConfig()` to read new env vars

3. Implement provider in `db`, `dbServer`, and `auth` exports

4. Document configuration in this README

5. Update `packages/migrations/` with vendor-specific notes

## Environment Variables Reference

| Variable | Provider | Required | Purpose |
| ---------- | ---------- | ---------- | --------- |
| `DB_PROVIDER` | All | No (default: `supabase`) | Which provider to use |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Yes | API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Yes | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | No | Server-side admin key |
| `DATABASE_URL` | PostgreSQL | Yes | Connection string |

## See Also

- [Supabase Local Development](../../apps/docs/content/specs/supabase-local-development.mdx)
- [Database Schema](../migrations/README.md)
- [Vercel + Supabase Deployment](../../apps/docs/content/deploy/vercel-supabase.mdx)
