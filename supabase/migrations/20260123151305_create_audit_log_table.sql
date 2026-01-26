-- Create audit_log table (immutable, append-only)
-- Reference: /specs/database-schema#4-audit_log
-- Sprint 0.5 Phase A Task 4

-- Create event_type enum
CREATE TYPE audit_event_type AS ENUM (
  'dispatch_created',
  'dispatch_updated',
  'dispatch_closed',
  'dispatch_reopened',
  'dispatch_escalated',
  'responder_joined',
  'responder_status_updated',
  'location_updated',
  'urgency_updated',
  'description_updated'
);

-- Create audit_log table
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  dispatch_id VARCHAR(32) NOT NULL,
  responder_entry_id VARCHAR(32),
  region_id VARCHAR(32) NOT NULL,
  
  -- Event details
  event_type audit_event_type NOT NULL,
  actor_id VARCHAR(32),
  before_state JSONB,
  after_state JSONB,
  changed_fields JSONB,
  
  -- Timestamp (immutable)
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign keys
  CONSTRAINT fk_audit_dispatch FOREIGN KEY (dispatch_id) 
    REFERENCES dispatches(id) ON DELETE CASCADE,
  CONSTRAINT fk_audit_responder FOREIGN KEY (responder_entry_id) 
    REFERENCES responders(id) ON DELETE SET NULL,
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_audit_log_dispatch ON audit_log(dispatch_id);
CREATE INDEX idx_audit_log_region ON audit_log(region_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_log_event_type ON audit_log(event_type);
CREATE INDEX idx_audit_log_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_log_dispatch_timestamp ON audit_log(dispatch_id, timestamp DESC);

-- Prevent updates and deletes (immutable)
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is immutable: updates and deletes are not allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_log_update
  BEFORE UPDATE ON audit_log
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

CREATE TRIGGER prevent_audit_log_delete
  BEFORE DELETE ON audit_log
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

-- Add comments for documentation
COMMENT ON TABLE audit_log IS 'Immutable, append-only event log for all mutations';
COMMENT ON COLUMN audit_log.id IS 'Auto-incrementing primary key (BIGSERIAL)';
COMMENT ON COLUMN audit_log.dispatch_id IS 'Foreign key to dispatches table';
COMMENT ON COLUMN audit_log.responder_entry_id IS 'Foreign key to responders table (nullable)';
COMMENT ON COLUMN audit_log.event_type IS 'Type of event that occurred';
COMMENT ON COLUMN audit_log.actor_id IS 'User who performed the action (null for system events)';
COMMENT ON COLUMN audit_log.before_state IS 'JSONB snapshot of data before change';
COMMENT ON COLUMN audit_log.after_state IS 'JSONB snapshot of data after change';
COMMENT ON COLUMN audit_log.changed_fields IS 'JSONB array of field names that changed';
COMMENT ON COLUMN audit_log.timestamp IS 'Immutable timestamp of the event';
