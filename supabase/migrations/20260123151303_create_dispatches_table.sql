-- Create dispatches table
-- Reference: /specs/database-schema#table-dispatches
-- Sprint 0.5 Phase A Task 2

-- Create location_precision enum
CREATE TYPE location_precision AS ENUM ('exact', 'block', 'neighborhood', 'city');

-- Create urgency enum
CREATE TYPE urgency_level AS ENUM ('low', 'normal', 'critical');

-- Create dispatch status enum
CREATE TYPE dispatch_status AS ENUM ('open', 'acknowledged', 'escalated', 'closed', 'reopened');

-- Create closure_reason enum
CREATE TYPE closure_reason AS ENUM (
  'turned_out_okay',
  'help_arrived',
  'unable_to_help',
  'duplicate',
  'administrative'
);

-- Create dispatches table
CREATE TABLE dispatches (
  id VARCHAR(32) PRIMARY KEY,
  region_id VARCHAR(32) NOT NULL,
  submitter_id VARCHAR(32) NOT NULL,
  client_id VARCHAR(36),
  
  -- Location (required)
  location_lat DECIMAL(8, 6) NOT NULL,
  location_lon DECIMAL(9, 6) NOT NULL,
  location_description VARCHAR(256),
  location_precision location_precision NOT NULL DEFAULT 'block',
  
  -- Dispatch details
  description TEXT,
  urgency urgency_level NOT NULL DEFAULT 'normal',
  status dispatch_status NOT NULL DEFAULT 'open',
  
  -- Closure details
  closure_reason closure_reason,
  closed_at TIMESTAMPTZ,
  closed_by_id VARCHAR(32),
  
  -- Versioning & timestamps
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Soft delete
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Foreign keys
  CONSTRAINT fk_dispatches_submitter FOREIGN KEY (submitter_id) 
    REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_dispatches_closed_by FOREIGN KEY (closed_by_id) 
    REFERENCES users(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT unique_client_id UNIQUE (client_id, region_id),
  CONSTRAINT valid_latitude CHECK (location_lat >= -90 AND location_lat <= 90),
  CONSTRAINT valid_longitude CHECK (location_lon >= -180 AND location_lon <= 180),
  CONSTRAINT description_max_length CHECK (LENGTH(description) <= 2000)
);

-- Create indexes for performance
CREATE INDEX idx_dispatches_region ON dispatches(region_id);
CREATE INDEX idx_dispatches_status ON dispatches(status);
CREATE INDEX idx_dispatches_urgency ON dispatches(urgency);
CREATE INDEX idx_dispatches_created_at ON dispatches(created_at);
CREATE INDEX idx_dispatches_submitter ON dispatches(submitter_id);
CREATE INDEX idx_dispatches_region_status ON dispatches(region_id, status);
CREATE INDEX idx_dispatches_region_created ON dispatches(region_id, created_at DESC);
CREATE INDEX idx_dispatches_is_deleted ON dispatches(is_deleted);

-- Create updated_at trigger
CREATE TRIGGER update_dispatches_updated_at
  BEFORE UPDATE ON dispatches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE dispatches IS 'Core dispatch records with location, status, and versioning';
COMMENT ON COLUMN dispatches.id IS 'Primary key, format: dsp_<uuid>';
COMMENT ON COLUMN dispatches.region_id IS 'Zip code for geographic routing, e.g. "97201" for Portland downtown';
COMMENT ON COLUMN dispatches.client_id IS 'Idempotency key (UUID) for offline sync';
COMMENT ON COLUMN dispatches.location_lat IS 'Latitude, range: [-90, 90]';
COMMENT ON COLUMN dispatches.location_lon IS 'Longitude, range: [-180, 180]';
COMMENT ON COLUMN dispatches.version IS 'Optimistic locking version, increments on update';
COMMENT ON COLUMN dispatches.is_deleted IS 'Soft delete flag, TRUE = deleted but preserved';
