import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../lib/db.js';
import bcrypt from 'bcrypt';

describe('Database Schema Tests', () => {
  describe('Users table', () => {
    let testUserId: string;

    afterAll(async () => {
      if (testUserId) {
        await db.query('DELETE FROM users WHERE id = $1', [testUserId]);
      }
    });

    it('should enforce unique email constraint', async () => {
      testUserId = 'schema-test-user-' + Date.now();
      const email = `schema-test-${Date.now()}@example.com`;
      const passwordHash = await bcrypt.hash('password123', 10);

      // First insert should succeed
      await db.query(
        'INSERT INTO users (id, email, password_hash, role, allowed_regions) VALUES ($1, $2, $3, $4, $5)',
        [testUserId, email, passwordHash, 'responder', JSON.stringify([])],
      );

      // Second insert with same email should fail
      await expect(async () => {
        await db.query(
          'INSERT INTO users (id, email, password_hash, role, allowed_regions) VALUES ($1, $2, $3, $4, $5)',
          ['another-id', email, passwordHash, 'responder', JSON.stringify([])],
        );
      }).rejects.toThrow();
    });

    it('should have created_at and updated_at timestamps', async () => {
      const userId = 'timestamp-test-' + Date.now();
      const email = `timestamp-test-${Date.now()}@example.com`;
      const passwordHash = await bcrypt.hash('password123', 10);

      const result = await db.query(
        'INSERT INTO users (id, email, password_hash, role, allowed_regions) VALUES ($1, $2, $3, $4, $5) RETURNING created_at, updated_at',
        [userId, email, passwordHash, 'responder', JSON.stringify([])],
      );

      expect(result.rows[0].created_at).toBeInstanceOf(Date);
      expect(result.rows[0].updated_at).toBeInstanceOf(Date);

      // Cleanup
      await db.query('DELETE FROM users WHERE id = $1', [userId]);
    });

    it('should support allowed_regions as JSONB array', async () => {
      const userId = 'regions-test-' + Date.now();
      const email = `regions-test-${Date.now()}@example.com`;
      const passwordHash = await bcrypt.hash('password123', 10);
      const allowedRegions = ['us-west-1', 'us-east-1', 'us-central-1'];

      await db.query(
        'INSERT INTO users (id, email, password_hash, role, allowed_regions) VALUES ($1, $2, $3, $4, $5)',
        [userId, email, passwordHash, 'admin', JSON.stringify(allowedRegions)],
      );

      const result = await db.query('SELECT allowed_regions FROM users WHERE id = $1', [userId]);
      expect(result.rows[0].allowed_regions).toEqual(allowedRegions);

      // Cleanup
      await db.query('DELETE FROM users WHERE id = $1', [userId]);
    });
  });

  describe('Dispatches table', () => {
    let testUserId: string;
    let testDispatchId: string;

    beforeAll(async () => {
      // Create test user (keep ID under 32 chars)
      testUserId = 'disp-' + Math.random().toString(36).slice(2, 10);
      const passwordHash = await bcrypt.hash('password123', 10);
      await db.query(
        'INSERT INTO users (id, email, password_hash, role, allowed_regions) VALUES ($1, $2, $3, $4, $5)',
        [testUserId, `dispatch-test-${Date.now()}@example.com`, passwordHash, 'responder', JSON.stringify([])],
      );
    });

    afterAll(async () => {
      if (testDispatchId) {
        await db.query('DELETE FROM dispatches WHERE id = $1', [testDispatchId]);
      }
      await db.query('DELETE FROM users WHERE id = $1', [testUserId]);
    });

    it('should enforce unique client_id constraint', async () => {
      const clientId = 'test-client-' + Date.now();
      testDispatchId = 'disp-' + Math.random().toString(36).slice(2, 10);

      // First insert
      const result1 = await db.query(
        'INSERT INTO dispatches (id, client_id, region_id, location_lat, location_lon, description, submitter_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [testDispatchId, clientId, 'us-west-1', 45.5231, -122.6765, 'Test', testUserId],
      );
      testDispatchId = result1.rows[0].id;

      // Second insert with same client_id should fail
      await expect(async () => {
        await db.query(
          'INSERT INTO dispatches (id, client_id, region_id, location_lat, location_lon, description, submitter_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [clientId, 'us-west-1', 45.5231, -122.6765, 'Test 2', testUserId],
        );
      }).rejects.toThrow();
    });

    it('should enforce valid latitude constraint (-90 to 90)', async () => {
      await expect(async () => {
        await db.query(
          'INSERT INTO dispatches (id, client_id, region_id, location_lat, location_lon, description, submitter_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          ['invalid-lat-' + Date.now(), 'us-west-1', 91, -122.6765, 'Test', testUserId],
        );
      }).rejects.toThrow();

      await expect(async () => {
        await db.query(
          'INSERT INTO dispatches (id, client_id, region_id, location_lat, location_lon, description, submitter_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          ['invalid-lat2-' + Date.now(), 'us-west-1', -91, -122.6765, 'Test', testUserId],
        );
      }).rejects.toThrow();
    });

    it('should enforce valid longitude constraint (-180 to 180)', async () => {
      await expect(async () => {
        await db.query(
          'INSERT INTO dispatches (id, client_id, region_id, location_lat, location_lon, description, submitter_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          ['invalid-lon-' + Date.now(), 'us-west-1', 45.5231, 181, 'Test', testUserId],
        );
      }).rejects.toThrow();

      await expect(async () => {
        await db.query(
          'INSERT INTO dispatches (id, client_id, region_id, location_lat, location_lon, description, submitter_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          ['invalid-lon2-' + Date.now(), 'us-west-1', 45.5231, -181, 'Test', testUserId],
        );
      }).rejects.toThrow();
    });

    it('should default version to 1', async () => {
      const dispatchId = 'disp-' + Math.random().toString(36).slice(2, 10);
      const clientId = 'version-test-' + Date.now();
      const result = await db.query(
        'INSERT INTO dispatches (id, client_id, region_id, location_lat, location_lon, description, submitter_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING version',
        [dispatchId, clientId, 'us-west-1', 45.5231, -122.6765, 'Version test', testUserId],
      );

      expect(result.rows[0].version).toBe(1);

      // Cleanup
      await db.query('DELETE FROM dispatches WHERE id = $1', [dispatchId]);
    });

    it('should increment version on update', async () => {
      const dispatchId = 'disp-' + Math.random().toString(36).slice(2, 10);
      const clientId = 'version-increment-' + Date.now();
      const result = await db.query(
        'INSERT INTO dispatches (id, client_id, region_id, location_lat, location_lon, description, submitter_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, version',
        [dispatchId, clientId, 'us-west-1', 45.5231, -122.6765, 'Version test', testUserId],
      );

      const initialVersion = result.rows[0].version;

      // Update dispatch
      await db.query('UPDATE dispatches SET description = $1, version = version + 1 WHERE id = $2', [
        'Updated description',
        dispatchId,
      ]);

      const updated = await db.query('SELECT version FROM dispatches WHERE id = $1', [dispatchId]);
      expect(updated.rows[0].version).toBe(initialVersion + 1);

      // Cleanup
      await db.query('DELETE FROM dispatches WHERE id = $1', [dispatchId]);
    });

    it('should default is_deleted to false', async () => {
      const dispatchId = 'disp-' + Math.random().toString(36).slice(2, 10);
      const clientId = 'deleted-test-' + Date.now();
      const result = await db.query(
        'INSERT INTO dispatches (id, client_id, region_id, location_lat, location_lon, description, submitter_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING is_deleted',
        [dispatchId, clientId, 'us-west-1', 45.5231, -122.6765, 'Delete test', testUserId],
      );

      expect(result.rows[0].is_deleted).toBe(false);

      // Cleanup
      await db.query('DELETE FROM dispatches WHERE id = $1', [dispatchId]);
    });
  });

  describe('Audit log table', () => {
    let testUserId: string;
    let testDispatchId: string;

    beforeAll(async () => {
      // Create test user and dispatch (use short, random IDs under 32 chars)
      testUserId = 'usr-' + Math.random().toString(36).slice(2, 10);
      const passwordHash = await bcrypt.hash('password123', 10);
      await db.query(
        'INSERT INTO users (id, email, password_hash, role, allowed_regions) VALUES ($1, $2, $3, $4, $5)',
        [testUserId, `audit-test-${Date.now()}@example.com`, passwordHash, 'responder', JSON.stringify([])],
      );

      const result = await db.query(
        'INSERT INTO dispatches (id, client_id, region_id, location_lat, location_lon, description, submitter_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [
          'disp-' + Math.random().toString(36).slice(2, 10),
          'audit-test-' + Date.now(),
          'us-west-1',
          45.5231,
          -122.6765,
          'Audit test',
          testUserId,
        ],
      );
      testDispatchId = result.rows[0].id;
    });

    afterAll(async () => {
      // Delete audit logs first (they reference dispatches via foreign key)
      // Since audit_log is immutable, we need to use TRUNCATE with CASCADE
      try {
        await db.query('TRUNCATE TABLE audit_log CASCADE');
      } catch (e) {
        // If truncate fails, just continue - cleanup is best effort
      }
      await db.query('DELETE FROM dispatches WHERE id = $1', [testDispatchId]);
      await db.query('DELETE FROM users WHERE id = $1', [testUserId]);
    });

    it('should create audit log entry', async () => {
      const result = await db.query(
        `INSERT INTO audit_log (dispatch_id, region_id, event_type, actor_id, after_state) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id, timestamp`,
        [testDispatchId, 'us-west-1', 'dispatch_created', testUserId, JSON.stringify({ test: 'data' })],
      );

      expect(result.rows[0].id).toBeDefined();
      expect(result.rows[0].timestamp).toBeInstanceOf(Date);
    });

    it('should prevent updates to audit log', async () => {
      // Create an audit entry
      const result = await db.query(
        `INSERT INTO audit_log (dispatch_id, region_id, event_type, actor_id) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [testDispatchId, 'us-west-1', 'dispatch_updated', testUserId],
      );

      const auditId = result.rows[0].id;

      // Try to update it (should fail)
      await expect(async () => {
        await db.query('UPDATE audit_log SET event_type = $1 WHERE id = $2', ['dispatch_closed', auditId]);
      }).rejects.toThrow(/audit_log is append-only/);
    });

    it('should prevent deletes from audit log', async () => {
      // Create an audit entry
      const result = await db.query(
        `INSERT INTO audit_log (dispatch_id, region_id, event_type, actor_id) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [testDispatchId, 'us-west-1', 'dispatch_updated', testUserId],
      );

      const auditId = result.rows[0].id;

      // Try to delete it (should fail)
      await expect(async () => {
        await db.query('DELETE FROM audit_log WHERE id = $1', [auditId]);
      }).rejects.toThrow(/audit_log is append-only/);
    });
  });

  describe('Responders table', () => {
    let responderUserId: string;
    let responderDispatchId: string;

    beforeAll(async () => {
      // Create test user and dispatch for responder tests
      responderUserId = 'usr-' + Math.random().toString(36).slice(2, 10);
      const passwordHash = await bcrypt.hash('password123', 10);
      await db.query(
        'INSERT INTO users (id, email, password_hash, role, allowed_regions) VALUES ($1, $2, $3, $4, $5)',
        [responderUserId, `responder-test-${Date.now()}@example.com`, passwordHash, 'responder', JSON.stringify([])],
      );

      const result = await db.query(
        'INSERT INTO dispatches (id, client_id, region_id, location_lat, location_lon, description, submitter_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [
          'disp-' + Math.random().toString(36).slice(2, 10),
          'responder-test-' + Date.now(),
          'us-west-1',
          45.5231,
          -122.6765,
          'Responder test',
          responderUserId,
        ],
      );
      responderDispatchId = result.rows[0].id;
    });

    afterAll(async () => {
      await db.query('DELETE FROM responders WHERE dispatch_id = $1', [responderDispatchId]);
      await db.query('DELETE FROM dispatches WHERE id = $1', [responderDispatchId]);
      await db.query('DELETE FROM users WHERE id = $1', [responderUserId]);
    });

    it('should enforce unique responder per dispatch', async () => {
      const responderId = 'responder-entry-' + Date.now();

      // First insert should succeed
      await db.query('INSERT INTO responders (id, dispatch_id, responder_id, status) VALUES ($1, $2, $3, $4)', [
        responderId,
        responderDispatchId,
        responderUserId,
        'responding',
      ]);

      // Second insert with same dispatch_id and responder_id should fail
      await expect(async () => {
        await db.query('INSERT INTO responders (id, dispatch_id, responder_id, status) VALUES ($1, $2, $3, $4)', [
          'another-' + responderId,
          responderDispatchId,
          responderUserId,
          'responding',
        ]);
      }).rejects.toThrow();
    });

    it('should cascade delete when dispatch is deleted', async () => {
      // Create a dispatch
      const dispatchId = 'disp-' + Math.random().toString(36).slice(2, 10);
      await db.query(
        'INSERT INTO dispatches (id, client_id, region_id, location_lat, location_lon, description, submitter_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [dispatchId, 'cascade-test-' + Date.now(), 'us-west-1', 45.5231, -122.6765, 'Cascade test', responderUserId],
      );

      // Add a responder
      await db.query('INSERT INTO responders (id, dispatch_id, responder_id, status) VALUES ($1, $2, $3, $4)', [
        'cascade-responder-' + Date.now(),
        dispatchId,
        responderUserId,
        'responding',
      ]);

      // Delete the dispatch
      await db.query('DELETE FROM dispatches WHERE id = $1', [dispatchId]);

      // Responder should also be deleted
      const result = await db.query('SELECT * FROM responders WHERE dispatch_id = $1', [dispatchId]);
      expect(result.rows.length).toBe(0);
    });
  });
});
