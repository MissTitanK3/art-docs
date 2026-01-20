-- Row Level Security policies for responders table

-- Enable RLS
ALTER TABLE responders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS responders_view_own_dispatch ON responders;
DROP POLICY IF EXISTS responders_join_dispatch ON responders;
DROP POLICY IF EXISTS responders_update_own ON responders;
DROP POLICY IF EXISTS responders_admin_all ON responders;

-- Responders can view entries for dispatches they can see
CREATE POLICY responders_view_own_dispatch ON responders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dispatches
      WHERE dispatches.id = responders.dispatch_id
      AND region_id = ANY(string_to_array(current_setting('app.user_regions', true)::text, ','))
    )
  );

-- Responders can join dispatches in their region
CREATE POLICY responders_join_dispatch ON responders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    responder_id = current_setting('app.user_id', true)::text
    AND EXISTS (
      SELECT 1 FROM dispatches
      WHERE dispatches.id = responders.dispatch_id
      AND region_id = ANY(string_to_array(current_setting('app.user_regions', true)::text, ','))
      AND NOT is_deleted
    )
  );

-- Responders can update their own status
CREATE POLICY responders_update_own ON responders
  FOR UPDATE
  TO authenticated
  USING (responder_id = current_setting('app.user_id', true)::text)
  WITH CHECK (responder_id = current_setting('app.user_id', true)::text);

-- Admins can manage all responders in their regions
CREATE POLICY responders_admin_all ON responders
  FOR ALL
  TO authenticated
  USING (
    current_setting('app.user_role', true)::text = 'admin'
    AND EXISTS (
      SELECT 1 FROM dispatches
      WHERE dispatches.id = responders.dispatch_id
      AND region_id = ANY(string_to_array(current_setting('app.user_regions', true)::text, ','))
    )
  );

-- Comments
COMMENT ON POLICY responders_view_own_dispatch ON responders IS 'Responders can view entries for dispatches in their region';
COMMENT ON POLICY responders_join_dispatch ON responders IS 'Responders can join dispatches in their region';
COMMENT ON POLICY responders_update_own ON responders IS 'Responders can update their own status';
COMMENT ON POLICY responders_admin_all ON responders IS 'Admins can manage responders in their regions';
