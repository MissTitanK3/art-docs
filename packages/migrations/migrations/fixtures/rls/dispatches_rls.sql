-- Row Level Security policies for dispatches table

-- Enable RLS
ALTER TABLE dispatches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS dispatches_region_isolation ON dispatches;
DROP POLICY IF EXISTS dispatches_responder_read ON dispatches;
DROP POLICY IF EXISTS dispatches_responder_create ON dispatches;
DROP POLICY IF EXISTS dispatches_admin_all ON dispatches;

-- Region isolation: all users can only see dispatches in their allowed regions
CREATE POLICY dispatches_region_isolation ON dispatches
  FOR SELECT
  TO authenticated
  USING (
    region_id = ANY(string_to_array(current_setting('app.user_regions', true)::text, ','))
    AND NOT is_deleted
  );

-- Responders can create dispatches
CREATE POLICY dispatches_responder_create ON dispatches
  FOR INSERT
  TO authenticated
  WITH CHECK (
    region_id = ANY(string_to_array(current_setting('app.user_regions', true)::text, ','))
    AND submitter_id = current_setting('app.user_id', true)::text
  );

-- Responders can update dispatches they created or are assigned to
CREATE POLICY dispatches_responder_update ON dispatches
  FOR UPDATE
  TO authenticated
  USING (
    region_id = ANY(string_to_array(current_setting('app.user_regions', true)::text, ','))
    AND (
      submitter_id = current_setting('app.user_id', true)::text
      OR EXISTS (
        SELECT 1 FROM responders
        WHERE responders.dispatch_id = dispatches.id
        AND responders.responder_id = current_setting('app.user_id', true)::text
      )
    )
  );

-- Admins have full access to dispatches in their regions
CREATE POLICY dispatches_admin_all ON dispatches
  FOR ALL
  TO authenticated
  USING (
    current_setting('app.user_role', true)::text = 'admin'
    AND region_id = ANY(string_to_array(current_setting('app.user_regions', true)::text, ','))
  )
  WITH CHECK (
    current_setting('app.user_role', true)::text = 'admin'
    AND region_id = ANY(string_to_array(current_setting('app.user_regions', true)::text, ','))
  );

-- Comments
COMMENT ON POLICY dispatches_region_isolation ON dispatches IS 'Users can only see dispatches in their allowed regions';
COMMENT ON POLICY dispatches_responder_create ON dispatches IS 'Responders can create dispatches in their regions';
COMMENT ON POLICY dispatches_responder_update ON dispatches IS 'Responders can update dispatches they created or are assigned to';
COMMENT ON POLICY dispatches_admin_all ON dispatches IS 'Admins have full access to dispatches in their regions';
