# Database Migrations

Sprint 0.5 Phase A - Database Schema Implementation

## Overview

This directory contains PostgreSQL migrations for Supabase. The migrations create the core database schema for the Region Dispatch System MVP.

## Migration Files

| Migration | Description | Status |
| ----------- | ------------- | -------- |
| `20260123151302_create_users_table.sql` | Users table with roles and region permissions | ✅ Complete |
| `20260123151303_create_dispatches_table.sql` | Dispatches with location, status, versioning | ✅ Complete |
| `20260123151304_create_responders_table.sql` | Junction table for dispatch responders | ✅ Complete |
| `20260123151305_create_audit_log_table.sql` | Immutable audit log with JSONB state tracking | ✅ Complete |

## Database Schema

### Tables

#### `users`

- **Purpose:** User accounts with roles and multi-region access
- **Key Features:**
  - Role-based access (responder, admin, viewer)
  - JSONB allowed_regions stores array of zip codes user can access
  - Soft delete via `is_active` flag
  - Auto-updating `updated_at` trigger

#### `dispatches`

- **Purpose:** Core dispatch records with location and status
- **Key Features:**
  - `region_id` stores zip code for geographic routing (e.g., "97201", "80202")
  - Location with lat/lon validation (CHECK constraints)
  - Status state machine (open → acknowledged → escalated → closed → reopened)
  - Optimistic locking via `version` field
  - Client-side idempotency via `client_id`
  - Soft delete via `is_deleted` flag
  - Multiple ENUMs: status, urgency, location_precision, closure_reason

#### `responders`

- **Purpose:** Junction table tracking who is responding to dispatches
- **Key Features:**
  - Many-to-many relationship (dispatch ↔ users)
  - UNIQUE constraint prevents duplicate responders
  - CASCADE delete when dispatch removed
  - `region_id` denormalized (zip code) for query performance
  - Status tracking (responding → arrived → assisting → cleared)

#### `audit_log`

- **Purpose:** Immutable event log for accountability
- **Key Features:**
  - BIGSERIAL auto-incrementing ID
  - JSONB state snapshots (before/after)
  - Immutability enforced by triggers (prevents UPDATE/DELETE)
  - Comprehensive event types

## Setup & Usage

### Prerequisites

#### **Option 1: Use npx (Recommended - No Installation Needed)**

```bash
npx supabase --version
```

#### **Option 2: Install Supabase CLI Globally**

```bash
# macOS
brew install supabase/tap/supabase

# Linux (standalone binary)
# Download from: https://github.com/supabase/cli/releases

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Note:** The `npm install -g supabase` method is not supported. Use npx or platform-specific installers.

### Local Development

1. **Start Supabase locally:**

   ```bash
   npx supabase start
   ```

   This spins up a local PostgreSQL container with all services.

2. **Apply migrations:**

   ```bash
   npx supabase db reset
   ```

   This applies all migrations and runs the seed script.

3. **Check migration status:**

   ```bash
   npx supabase migration list
   ```

4. **Access local database:**
   - Database URL: `postgresql://postgres:postgres@localhost:54322/postgres`
   - Studio UI: `http://localhost:54323`

### Creating New Migrations

```bash
# Generate a new migration file
npx supabase migration new <migration_name>

# Example:
npx supabase migration new add_dispatches_index
```

### Testing Migrations

```bash
# Apply migrations
npx supabase db reset

# Verify tables exist
psql postgresql://postgres:postgres@localhost:54322/postgres -c "\dt"

# Run sample queries
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT COUNT(*) FROM users;"
```

## Seed Data

The `seed.sql` file includes test data for local development:

- 5 users (1 admin, 3 responders, 1 viewer)
- 5 dispatches across 3 cities:
  - Portland, OR: zip codes 97201, 97209
  - Denver, CO: zip codes 80202, 80203
  - Boston, MA: zip code 02108
- 2 responder assignments
- 4 audit log entries

**Test Credentials:**

- All users have password: `password123` (bcrypt hashed)
- Example: `admin@example.com` / `password123`

**Zip Code Access:**

- Admin & Viewer: All zip codes across all 3 cities
- Responder 1: Portland area (97201, 97209, 97214)
- Responder 2: Denver area (80202, 80203, 80205)
- Responder 3: Boston area (02108, 02116, 02215)

## Schema Validation

### Constraints Enforced

- **Location:** Latitude [-90, 90], Longitude [-180, 180]
- **Description:** Max 2000 characters
- **Idempotency:** UNIQUE (client_id, region_id)
- **Immutability:** audit_log prevents UPDATE/DELETE
- **Responders:** UNIQUE (dispatch_id, responder_id)

### Foreign Keys

- `dispatches.submitter_id` → `users.id` (ON DELETE RESTRICT)
- `dispatches.closed_by_id` → `users.id` (ON DELETE SET NULL)
- `responders.dispatch_id` → `dispatches.id` (ON DELETE CASCADE)
- `responders.responder_id` → `users.id` (ON DELETE RESTRICT)
- `audit_log.dispatch_id` → `dispatches.id` (ON DELETE CASCADE)
- `audit_log.responder_entry_id` → `responders.id` (ON DELETE SET NULL)
- `audit_log.actor_id` → `users.id` (ON DELETE SET NULL)

## Performance Indexes

All tables include optimized indexes for common queries:

### `users` idx

- Email (login)
- Role (filtering)
- is_active (filtering)
- created_at (timeseries)

### `dispatches` idx

- region_id, status (active dispatch listing)
- region_id, created_at DESC (pagination)
- submitter_id (user's dispatches)
- urgency (filtering)

### `responders` idx

- dispatch_id (lookup responders for dispatch)
- responder_id (lookup dispatches for responder)
- region_id (regional queries)
- status (filtering)

### `audit_log` idx

- dispatch_id, timestamp DESC (audit trail)
- region_id (regional queries)
- event_type (filtering)
- actor_id (user activity)

## Troubleshooting

### Migration fails

```bash
# Reset the database completely
npx supabase db reset --no-seed

# Check migration errors
npx supabase db diff
```

### Connection issues

```bash
# Restart Supabase
npx supabase stop
npx supabase start

# Check service status
npx supabase status
```

### Schema out of sync

```bash
# Generate diff from remote
npx supabase db diff --linked

# Or from local
npx supabase db diff
```

## Related Documentation

- [Database Schema Spec](/apps/docs/content/specs/database-schema.mdx)
- [Sprint 0.5](/apps/docs/content/roadmap/sprint_0_5/sprint_0_5.mdx)
- [Backend API Contracts](/apps/docs/content/specs/backend-api-contracts.mdx)
- [Supabase Local Development](https://supabase.com/docs/guides/local-development)

## Next Steps

### **Phase B: API Implementation**

- [ ] Implement POST /auth/login
- [ ] Implement POST /dispatches
- [ ] Implement GET /dispatches
- [ ] Create `@repo/db` client wrapper for type-safe queries
- [ ] Add database integration tests

---

**Last Updated:** 2026-01-23  
**Sprint:** 0.5 Phase A  
**Status:** ✅ Complete
