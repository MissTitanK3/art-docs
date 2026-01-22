# Database Migrations

## **Status: Deferred - Post Sprint 0**

This package is reserved for database migrations and schema management. It is not needed for Sprint 0, which has no database schema or migrations in scope.

## Sprint 0 Scope

Sprint 0 explicitly excludes:

- Database schema and migrations
- API contracts
- Authentication and roles

See [Sprint 0 Documentation](../../apps/docs/content/roadmap/sprint_0/sprint_0.mdx) for details.

## Future Use

Once Sprint 0 completes, this package will handle:

- Database schema migrations using graphile-migrate
- Region-specific initialization
- Data seeding and fixtures

## Setup (Post-Sprint 0)

When needed, this package will:

1. Use graphile-migrate for version-controlled migrations
2. Provide region initialization scripts
3. Support multi-region database setup

Refer to commit history for implementation details when reactivating.

Or use the test script to verify everything works:

```bash
export $(cat .env | grep -v '^#' | xargs) && ./test-phase-a.sh
```

### Development Workflow

1. **Make changes** to `migrations/current.sql` (must be idempotent)

2. **Watch mode** auto-applies on save:

   ```bash
   export $(cat .env | grep -v '^#' | xargs) && npm run migrate:watch
   ```

3. **Commit when ready**:

   ```bash
   export $(cat .env | grep -v '^#' | xargs) && npm run migrate:commit
   ```

### Environment Variables

**Important:** Always load `.env` before running npm scripts:

```bash
export $(cat .env | grep -v '^#' | xargs)
```

Required variables:

- `DATABASE_URL` - Main application database
- `SHADOW_DATABASE_URL` - Shadow DB for validation (graphile-migrate feature)
- `ROOT_DATABASE_URL` - Root connection for reset operations
- `REGION_ID` - Regional identifier (e.g., `us-west-1-local`)
- `REGION_TIMEZONE` - Timezone for the region

**Note:** If you get "environment variable not set" errors, ensure you ran the export command above.

## Commands

- `npm run migrate` - Run pending migrations (use this in production and CI/CD)
- `npm run migrate:watch` - Watch and auto-apply current.sql changes (development)
- `npm run migrate:commit` - Commit current.sql to committed/ folder (creates numbered migration)
- `npm run migrate:status` - Check migration status
- `npm run migrate:reset` - **DESTRUCTIVE** - Resets database to clean state
- `npm run region:init` - Initialize a new region
- `npm run schema:dump` - Dump schema for git tracking

**Always load environment variables first:**

```bash
export $(cat .env | grep -v '^#' | xargs) && npm run <command>
```

## Phase A Status

✅ **Phase A Complete** - Base database schema with users and dispatches tables

- Users table with roles and region permissions
- Dispatches table with location tracking and status workflow
- Foreign key relationships verified
- 15 indexes for performance
- Seed data includes 3 test users and 3 test dispatches

**Verify with:**

```bash
export $(cat .env | grep -v '^#' | xargs) && ./test-phase-a.sh
```

## Exploring the Database

### Connect to psql

If psql is installed locally:

```bash
export $(cat .env | grep -v '^#' | xargs)
psql "$DATABASE_URL"
```

### Useful psql Commands

Once connected, explore the database:

```sql
-- List all tables
\dt

-- Show schema of a specific table
\d users
\d dispatches

-- Count rows in each table
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM dispatches;

-- View all users
SELECT * FROM users;

-- View all dispatches with submitter emails
SELECT d.id, d.description, d.status, u.email 
FROM dispatches d 
JOIN users u ON d.submitter_id = u.id;

-- Show all indexes
SELECT * FROM pg_indexes WHERE tablename IN ('users', 'dispatches');

-- Exit psql
\q
```

## Region Initialization

To initialize a new region (e.g., `us-west-1`):

```bash
export REGION_ID=us-west-1
npm run region:init
```

```bash
cd /home/user/art/turbo/packages/migrations
REGION_ID=us-west-1-local DATABASE_URL=postgres://user:password@localhost:5432/dispatch_db pnpm run region:init
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

### Environment Variables Not Found

**Problem:** `ERROR: DATABASE_URL environment variable not set` or similar

**Solution:** Make sure to load .env before running commands:

```bash
cd /home/user/art/turbo/packages/migrations
export $(cat .env | grep -v '^#' | xargs)
npm run migrate
```

The `export $(cat .env...)` command parses your .env file and sets all variables in your shell session.

### Database Connection Refused

**Problem:** `error: could not translate host name` or connection timeout

**Solution:** Ensure PostgreSQL is running and reachable from `DATABASE_URL`.

### Shadow Database Issues

**Problem:** Migration fails with shadow database errors

**Solution:** Reset the shadow database:

```bash
export $(cat .env | grep -v '^#' | xargs)
dropdb dispatch_shadow
npm run migrate:commit
```

### All Tests Fail After Changes

**Problem:** Database state is inconsistent

**Solution:** Reset and reapply:

```bash
export $(cat .env | grep -v '^#' | xargs)
npm run migrate:reset
npm run migrate
./test-phase-a.sh
```

⚠️ **WARNING:** `migrate:reset` deletes all data in the database.
