/**
 * Database Client Abstraction
 *
 * This module provides a vendor-agnostic database client interface.
 * Apps import from '@repo/db' instead of directly using vendor-specific clients.
 *
 * Architecture:
 * - Apps use this abstraction layer (no vendor lock-in)
 * - Environment variables determine the provider (Supabase, raw PostgreSQL, etc.)
 * - Migrations in packages/migrations/ are vendor-agnostic
 * - Local development uses supabase/ for convenience
 *
 * Supported Providers:
 * - supabase: Supabase REST API + Auth (default for local dev)
 * - postgres: Raw PostgreSQL connection (for self-hosted or cloud Postgres)
 * - (future): mysql, mongodb, etc.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type DatabaseProvider = 'supabase' | 'postgres';

export interface DatabaseConfig {
  provider: DatabaseProvider;
  url?: string;
  key?: string; // For Supabase
  connectionString?: string; // For raw Postgres
}

/**
 * Get database configuration from environment variables
 */
function getDatabaseConfig(): DatabaseConfig {
  const provider = (process.env.DB_PROVIDER || 'supabase') as DatabaseProvider;

  switch (provider) {
    case 'supabase': {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !key) {
        throw new Error(
          'Missing Supabase configuration. Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY',
        );
      }

      return { provider: 'supabase', url, key };
    }

    case 'postgres': {
      const connectionString = process.env.DATABASE_URL;

      if (!connectionString) {
        throw new Error('Missing PostgreSQL configuration. Required: DATABASE_URL');
      }

      return { provider: 'postgres', url: connectionString, connectionString };
    }

    default:
      throw new Error(`Unsupported database provider: ${provider}`);
  }
}

/**
 * Database client abstraction
 *
 * Usage:
 * ```typescript
 * import { db } from '@repo/db';
 *
 * // Query data
 * const { data, error } = await db.from('users').select();
 *
 * // Insert data
 * await db.from('users').insert({ email: 'user@example.com' });
 * ```
 */
export const db = (() => {
  const config = getDatabaseConfig();

  switch (config.provider) {
    case 'supabase':
      // Supabase client with anon key (browser-safe)
      return createClient(config.url!, config.key!);

    case 'postgres':
      // TODO: Implement raw PostgreSQL client wrapper
      // Could use pg, postgres.js, or another library
      throw new Error('PostgreSQL provider not yet implemented. Use DB_PROVIDER=supabase for now.');

    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
})();

/**
 * Server-side database client with elevated privileges
 *
 * Usage:
 * ```typescript
 * import { dbServer } from '@repo/db';
 *
 * // Server-side operations with service role
 * await dbServer.from('users').insert({ ... });
 * ```
 */
export const dbServer = (() => {
  const config = getDatabaseConfig();

  switch (config.provider) {
    case 'supabase': {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!serviceRoleKey) {
        console.warn('SUPABASE_SERVICE_ROLE_KEY not set. Server operations will use anon key only.');
        return createClient(config.url!, config.key!);
      }

      return createClient(config.url!, serviceRoleKey);
    }

    case 'postgres':
      // TODO: Implement raw PostgreSQL client wrapper
      throw new Error('PostgreSQL provider not yet implemented.');

    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
})();

/**
 * Authentication client abstraction
 *
 * Usage:
 * ```typescript
 * import { auth } from '@repo/db';
 *
 * const { data, error } = await auth.signIn({ email, password });
 * const session = await auth.getSession();
 * ```
 */
export const auth = (() => {
  const config = getDatabaseConfig();

  switch (config.provider) {
    case 'supabase':
      return db.auth;

    case 'postgres':
      // TODO: Implement custom auth (JWT, sessions, etc.)
      throw new Error('PostgreSQL auth not yet implemented.');

    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
})() as InstanceType<typeof SupabaseClient>['auth'];

export default db;
