-- Audit log: immutable, append-only event log for accountability

DROP TABLE IF EXISTS audit_log CASCADE;

CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  dispatch_id VARCHAR(32) NOT NULL REFERENCES dispatches(id),
  responder_entry_id VARCHAR(32) REFERENCES responders(id),
  region_id VARCHAR(32) NOT NULL,
  
  -- Event details
  event_type audit_event_type NOT NULL,
  actor_id VARCHAR(32) REFERENCES users(id),
  before_state JSONB,
  after_state JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Metadata
  client_timestamp TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_audit_log_dispatch ON audit_log(dispatch_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_region_timestamp ON audit_log(region_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_event_type ON audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp DESC);

-- Make audit_log immutable (prevent updates/deletes)
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only and cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_audit_log_update ON audit_log;
CREATE TRIGGER prevent_audit_log_update
  BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

-- Comments
COMMENT ON TABLE audit_log IS 'Immutable append-only audit trail for all dispatch mutations';
COMMENT ON COLUMN audit_log.before_state IS 'JSON snapshot of data before mutation';
COMMENT ON COLUMN audit_log.after_state IS 'JSON snapshot of data after mutation';
COMMENT ON COLUMN audit_log.actor_id IS 'User who performed action (NULL for system events)';
