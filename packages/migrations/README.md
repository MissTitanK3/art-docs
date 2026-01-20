# Database Migrations

Database migration and region initialization package for the dispatch system.

## Structure

```bash
migrations/
├── current.sql              # Active development migration (idempotent)
├── fixtures/                # Reusable SQL components
│   ├── extensions.sql       # PostgreSQL extensions
│   ├── tables/              # Table definitions
│   ├── rls/                 # Row Level Security policies
│   ├── functions/           # Database functions
│   └── types/               # Custom types and enums
├── committed/               # Numbered, immutable migrations
└── scripts/                 # Helper scripts
```

## Quick Start

### Development Workflow

1. **Make changes** to `migrations/current.sql`:

   ```sql
   --!include tables/users.sql
   --!include rls/users_rls.sql
   ```

2. **Watch mode** auto-applies on save:

   ```bash
   npm run migrate:watch
   ```

3. **Commit when ready**:

   ```bash
   npm run migrate:commit -m "Add users table"
   ```

### Environment Variables

Required for all commands:

```bash
# Main database
export DATABASE_URL="postgres://user:pass@localhost:5432/dispatch_db"

# Shadow database (for development validation)
export SHADOW_DATABASE_URL="postgres://user:pass@localhost:5432/dispatch_shadow"

# Root database (for reset operations)
export ROOT_DATABASE_URL="postgres://postgres@localhost:5432/postgres"
```

## Commands

- `npm run migrate` - Run pending migrations (production)
- `npm run migrate:watch` - Watch and auto-apply current.sql (development)
- `npm run migrate:commit` - Commit current.sql to committed/
- `npm run migrate:status` - Check migration status
- `npm run migrate:reset` - **DESTRUCTIVE** Reset database
- `npm run region:init` - Initialize a new region
- `npm run schema:dump` - Dump schema for git tracking

## Region Initialization

To initialize a new region (e.g., `us-west-1`):

```bash
export REGION_ID=us-west-1
npm run region:init
```

This will:

1. Run all committed migrations
2. Set region-specific configuration
3. Optionally seed regional data

## Migration Best Practices

### Idempotency

All SQL in `current.sql` must be idempotent (can run multiple times):

```sql
-- ✅ Good: Can run multiple times
CREATE TABLE IF NOT EXISTS users (...);
DROP TABLE IF EXISTS old_table CASCADE;

-- ❌ Bad: Fails on second run
CREATE TABLE users (...);
ALTER TABLE users ADD COLUMN email TEXT;
```

### Using Fixtures

Break complex migrations into reusable pieces:

```sql
-- current.sql
--!include tables/dispatches.sql
--!include tables/responders.sql
--!include rls/dispatches_rls.sql
--!include functions/auto_escalate.sql
```

### RLS Policies

All tables must have Row Level Security enabled:

```sql
ALTER TABLE dispatches ENABLE ROW LEVEL SECURITY;

CREATE POLICY dispatches_region_isolation ON dispatches
  FOR ALL
  TO authenticated
  USING (region_id = current_setting('app.region_id')::text);
```

## Related Docs

- [Database Schema Spec](/turbo/apps/docs/content/specs/database-schema.mdx)
- [Region Scope Architecture](/turbo/apps/docs/content/specs/region-scope-architecture.mdx)

## Troubleshooting

### Drift Detection

If your local DB is out of sync with migrations:

```bash
npm run migrate:reset  # ⚠️ DESTRUCTIVE
npm run migrate:watch
```

### Shadow DB Issues

If shadow DB fails validation:

```bash
dropdb dispatch_shadow
createdb dispatch_shadow
npm run migrate:commit
```

### Migration Conflicts

If you have uncommitted changes and need to pull migrations:

```bash
npm run migrate:uncommit  # Move latest commit back to current.sql
# Merge conflicts in current.sql
npm run migrate:commit
```
