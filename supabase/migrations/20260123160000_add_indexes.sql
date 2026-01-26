-- Add recommended indexes for dispatches filtering
-- Created on 2026-01-23

CREATE INDEX IF NOT EXISTS idx_region_status ON dispatches (region_id, status);
CREATE INDEX IF NOT EXISTS idx_region_created ON dispatches (region_id, created_at DESC);
