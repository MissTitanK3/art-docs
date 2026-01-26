-- Create responders table (junction table: dispatch ↔ users)
-- Reference: /specs/database-schema#3-responders
-- Sprint 0.5 Phase A Task 3

-- Create responder status enum
CREATE TYPE responder_status AS ENUM ('responding', 'arrived', 'assisting', 'cleared');

-- Create responders table
CREATE TABLE responders (
  id VARCHAR(32) PRIMARY KEY,
  dispatch_id VARCHAR(32) NOT NULL,
  responder_id VARCHAR(32) NOT NULL,
  region_id VARCHAR(32) NOT NULL,
  
  -- Status tracking
  status responder_status NOT NULL DEFAULT 'responding',
  
  -- Timestamps
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign keys
  CONSTRAINT fk_responders_dispatch FOREIGN KEY (dispatch_id) 
    REFERENCES dispatches(id) ON DELETE CASCADE,
  CONSTRAINT fk_responders_user FOREIGN KEY (responder_id) 
    REFERENCES users(id) ON DELETE RESTRICT,
  
  -- Constraints
  CONSTRAINT unique_responder_per_dispatch UNIQUE (dispatch_id, responder_id)
);

-- Create indexes for performance
CREATE INDEX idx_responders_dispatch ON responders(dispatch_id);
CREATE INDEX idx_responders_user ON responders(responder_id);
CREATE INDEX idx_responders_region ON responders(region_id);
CREATE INDEX idx_responders_claimed_at ON responders(claimed_at);
CREATE INDEX idx_responders_status ON responders(status);

-- Create updated_at trigger
CREATE TRIGGER update_responders_updated_at
  BEFORE UPDATE ON responders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE responders IS 'Junction table tracking responders for each dispatch';
COMMENT ON COLUMN responders.id IS 'Primary key, format: resp_<uuid>';
COMMENT ON COLUMN responders.dispatch_id IS 'Foreign key to dispatches table';
COMMENT ON COLUMN responders.responder_id IS 'Foreign key to users table';
COMMENT ON COLUMN responders.region_id IS 'Denormalized zip code from dispatch for query performance';
COMMENT ON COLUMN responders.status IS 'Responder status: responding → arrived → assisting → cleared';
