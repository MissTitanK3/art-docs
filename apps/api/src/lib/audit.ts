import { db } from '../lib/db.js';

export type AuditEventType =
  | 'dispatch_created'
  | 'dispatch_updated'
  | 'dispatch_closed'
  | 'dispatch_reopened'
  | 'dispatch_escalated'
  | 'responder_joined'
  | 'responder_status_updated'
  | 'location_updated'
  | 'urgency_updated'
  | 'description_updated';

export interface AuditLogEntry {
  dispatch_id?: string;
  responder_entry_id?: string;
  region_id: string;
  event_type: AuditEventType;
  actor_id?: string;
  before_state?: Record<string, unknown>;
  after_state?: Record<string, unknown>;
  client_timestamp?: Date;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Create an audit log entry for a mutation
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await db.query(
      `INSERT INTO audit_log (
        dispatch_id, 
        responder_entry_id, 
        region_id, 
        event_type, 
        actor_id, 
        before_state, 
        after_state, 
        client_timestamp, 
        ip_address, 
        user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        entry.dispatch_id || null,
        entry.responder_entry_id || null,
        entry.region_id,
        entry.event_type,
        entry.actor_id || null,
        entry.before_state ? JSON.stringify(entry.before_state) : null,
        entry.after_state ? JSON.stringify(entry.after_state) : null,
        entry.client_timestamp || null,
        entry.ip_address || null,
        entry.user_agent || null,
      ],
    );
  } catch (error) {
    console.error('Failed to create audit log entry:', error);
    // Don't throw - audit logging failure should not block the main operation
  }
}

/**
 * Get audit log entries for a dispatch
 */
export async function getAuditLogsForDispatch(dispatchId: string, limit = 50) {
  const result = await db.query(
    `SELECT 
      id,
      dispatch_id,
      responder_entry_id,
      region_id,
      event_type,
      actor_id,
      before_state,
      after_state,
      timestamp,
      client_timestamp,
      ip_address
    FROM audit_log
    WHERE dispatch_id = $1
    ORDER BY timestamp DESC
    LIMIT $2`,
    [dispatchId, limit],
  );

  return result.rows;
}

/**
 * Get audit log entries for a region
 */
export async function getAuditLogsForRegion(regionId: string, limit = 100, cursor?: Date) {
  const result = await db.query(
    `SELECT 
      id,
      dispatch_id,
      responder_entry_id,
      region_id,
      event_type,
      actor_id,
      timestamp
    FROM audit_log
    WHERE region_id = $1
      ${cursor ? 'AND timestamp < $3' : ''}
    ORDER BY timestamp DESC
    LIMIT $2`,
    cursor ? [regionId, limit, cursor] : [regionId, limit],
  );

  return result.rows;
}
