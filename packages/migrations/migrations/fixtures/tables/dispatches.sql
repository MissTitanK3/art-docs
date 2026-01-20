-- Dispatches table: core dispatch/incident records

DROP TABLE IF EXISTS dispatches CASCADE;

CREATE TABLE dispatches (
  id VARCHAR(32) PRIMARY KEY,
  client_id VARCHAR(64) UNIQUE,
  region_id VARCHAR(32) NOT NULL,
  submitter_id VARCHAR(32) NOT NULL REFERENCES users(id),
  
  -- Location data
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lon DECIMAL(11, 8) NOT NULL,
  location_description TEXT,
  location_precision VARCHAR(20) DEFAULT 'high',
  
  -- Dispatch details
  description TEXT NOT NULL,
  urgency dispatch_urgency NOT NULL DEFAULT 'normal',
  status dispatch_status NOT NULL DEFAULT 'open',
  
  -- Closure tracking
  closure_reason TEXT,
  closed_at TIMESTAMPTZ,
  closed_by_id VARCHAR(32) REFERENCES users(id),
  
  -- Timestamps and versioning
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Soft delete
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Constraints
  CONSTRAINT valid_location_lat CHECK (location_lat BETWEEN -90 AND 90),
  CONSTRAINT valid_location_lon CHECK (location_lon BETWEEN -180 AND 180),
  CONSTRAINT closure_consistency CHECK (
    (status = 'closed' AND closed_at IS NOT NULL AND closed_by_id IS NOT NULL AND closure_reason IS NOT NULL)
    OR (status != 'closed' AND closed_at IS NULL AND closed_by_id IS NULL AND closure_reason IS NULL)
  )
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_dispatches_region_status ON dispatches(region_id, status) WHERE NOT is_deleted;
CREATE INDEX IF NOT EXISTS idx_dispatches_region_created ON dispatches(region_id, created_at DESC) WHERE NOT is_deleted;
CREATE INDEX IF NOT EXISTS idx_dispatches_submitter ON dispatches(submitter_id);
CREATE INDEX IF NOT EXISTS idx_dispatches_urgency ON dispatches(urgency) WHERE status IN ('open', 'acknowledged', 'dispatched');
CREATE INDEX IF NOT EXISTS idx_dispatches_created_at ON dispatches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dispatches_client_id ON dispatches(client_id);

-- Spatial index for location queries (if using PostGIS)
-- CREATE INDEX IF NOT EXISTS idx_dispatches_location ON dispatches USING GIST(ST_MakePoint(location_lon, location_lat));

-- Updated at trigger
DROP TRIGGER IF EXISTS update_dispatches_updated_at ON dispatches;
CREATE TRIGGER update_dispatches_updated_at
  BEFORE UPDATE ON dispatches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE dispatches IS 'Core dispatch/incident records with regional isolation';
COMMENT ON COLUMN dispatches.client_id IS 'Client-generated idempotency key for offline sync';
COMMENT ON COLUMN dispatches.region_id IS 'Region identifier for data isolation';
COMMENT ON COLUMN dispatches.version IS 'Optimistic locking version counter';
COMMENT ON COLUMN dispatches.is_deleted IS 'Soft delete flag for audit trail preservation';
COMMENT ON COLUMN dispatches.location_precision IS 'GPS precision: high, medium, low';
