-- Add optional radius metadata for general-area dispatches
ALTER TABLE dispatches
  ADD COLUMN IF NOT EXISTS location_radius_meters INTEGER
    CHECK (location_radius_meters IS NULL OR location_radius_meters >= 0);

COMMENT ON COLUMN dispatches.location_radius_meters IS 'Optional radius in meters for general-area dispatches (neighborhood mode)';
