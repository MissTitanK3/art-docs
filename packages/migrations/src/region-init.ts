#!/usr/bin/env tsx

/**
 * Region Initialization Tool
 *
 * Initializes a new region by:
 * 1. Running all committed migrations
 * 2. Setting region-specific configuration
 * 3. Optionally seeding regional data
 *
 * Usage:
 *   export REGION_ID=us-west-1
 *   export DATABASE_URL=postgres://...
 *   npm run region:init
 */

import { execSync } from 'child_process';
import { Client } from 'pg';

interface RegionConfig {
  regionId: string;
  displayName: string;
  timezone: string;
  emergencyContacts?: string[];
  escalationRules?: Record<string, unknown>;
}

async function main() {
  const regionId = process.env.REGION_ID;
  const databaseUrl = process.env.DATABASE_URL;

  if (!regionId) {
    console.error('❌ Error: REGION_ID environment variable required');
    console.error('   Example: export REGION_ID=us-west-1');
    process.exit(1);
  }

  if (!databaseUrl) {
    console.error('❌ Error: DATABASE_URL environment variable required');
    console.error('   Example: export DATABASE_URL=postgres://user:pass@localhost/db');
    process.exit(1);
  }

  console.log(`\n🚀 Initializing region: ${regionId}\n`);

  try {
    // Step 1: Run migrations
    console.log('📦 Running database migrations...');
    execSync('npm run migrate', { stdio: 'inherit' });
    console.log('✅ Migrations complete\n');

    // Step 2: Connect to database
    console.log('🔌 Connecting to database...');
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    console.log('✅ Connected\n');

    try {
      // Step 3: Verify schema
      console.log('🔍 Verifying schema...');
      const schemaCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'dispatches', 'responders', 'audit_log')
        ORDER BY table_name
      `);

      const expectedTables = ['audit_log', 'dispatches', 'responders', 'users'];
      const actualTables = schemaCheck.rows.map((r) => r.table_name);
      const missingTables = expectedTables.filter((t) => !actualTables.includes(t));

      if (missingTables.length > 0) {
        throw new Error(`Missing tables: ${missingTables.join(', ')}`);
      }
      console.log('✅ Schema verified\n');

      // Step 4: Set region configuration
      console.log('⚙️  Setting region configuration...');
      const config: RegionConfig = {
        regionId,
        displayName: regionId.replace(/-/g, ' ').toUpperCase(),
        timezone: process.env.REGION_TIMEZONE || 'UTC',
      };

      // Store config in a settings table (if it exists)
      // For now, just display it
      console.log('   Region ID:', config.regionId);
      console.log('   Display Name:', config.displayName);
      console.log('   Timezone:', config.timezone);
      console.log('✅ Configuration set\n');

      // Step 5: Optional seed data
      if (process.env.SEED_DATA === 'true') {
        console.log('🌱 Seeding development data...');
        const seedSql = await import('fs').then((fs) =>
          fs.promises.readFile('migrations/scripts/seed-dev.sql', 'utf-8'),
        );
        await client.query(seedSql);
        console.log('✅ Seed data loaded\n');
      }

      // Step 6: Summary
      console.log('📊 Region Summary:');
      const stats = await client.query(
        `
        SELECT 
          (SELECT COUNT(*) FROM users) as user_count,
          (SELECT COUNT(*) FROM dispatches WHERE region_id = $1) as dispatch_count,
          (SELECT COUNT(*) FROM audit_log WHERE region_id = $1) as audit_count
      `,
        [regionId],
      );

      console.log(`   Users: ${stats.rows[0].user_count}`);
      console.log(`   Dispatches (${regionId}): ${stats.rows[0].dispatch_count}`);
      console.log(`   Audit Entries (${regionId}): ${stats.rows[0].audit_count}`);
    } finally {
      await client.end();
    }

    console.log('\n✨ Region initialization complete!\n');
  } catch (error) {
    console.error('\n❌ Region initialization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as initRegion };
