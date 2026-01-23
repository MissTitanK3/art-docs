/**
 * Supabase Client Configuration
 *
 * This module provides a centralized, environment-aware Supabase client.
 * It reads from environment variables set in .env.local during development
 * or deployed environment variables in production.
 *
 * Rules:
 * - No environment-specific branching (same code for all environments)
 * - All credentials come from environment variables
 * - Client initialization is identical across all apps
 * - No hardcoded URLs or keys
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
      'Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local',
  );
}

/**
 * Browser-safe Supabase client for use in Next.js client components and API routes
 * Uses the anon key for public operations
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-side Supabase client for use in API routes and server actions
 * Uses the service role key for privileged operations (optional)
 */
export const supabaseServer = (() => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set. Server-side operations will use anon key only.');
    return createClient(supabaseUrl, supabaseAnonKey);
  }

  return createClient(supabaseUrl, serviceRoleKey);
})();

export default supabase;
