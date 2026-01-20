-- Responders table: junction table for dispatch-user assignments

DROP TABLE IF EXISTS responders CASCADE;

CREATE TABLE responders (
  id VARCHAR(32) PRIMARY KEY,
  dispatch_id VARCHAR(32) NOT NULL REFERENCES dispatches(id) ON DELETE CASCADE,
  responder_id VARCHAR(32) NOT NULL REFERENCES users(id),
  status responder_status NOT NULL DEFAULT 'responding',
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- One responder can't join same dispatch twice
  UNIQUE(dispatch_id, responder_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_responders_dispatch ON responders(dispatch_id);
CREATE INDEX IF NOT EXISTS idx_responders_user ON responders(responder_id);
CREATE INDEX IF NOT EXISTS idx_responders_status ON responders(status);
CREATE INDEX IF NOT EXISTS idx_responders_claimed_at ON responders(claimed_at DESC);

-- Updated at trigger
DROP TRIGGER IF EXISTS update_responders_updated_at ON responders;
CREATE TRIGGER update_responders_updated_at
  BEFORE UPDATE ON responders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE responders IS 'Junction table tracking which users are responding to which dispatches';
COMMENT ON COLUMN responders.status IS 'Current status: responding, arrived, assisting, cleared';
