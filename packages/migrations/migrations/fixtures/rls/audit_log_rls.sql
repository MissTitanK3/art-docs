-- Row Level Security policies for audit_log table

-- Enable RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS audit_log_admin_only ON audit_log;
DROP POLICY IF EXISTS audit_log_region_isolation ON audit_log;

-- Only admins can view audit logs
CREATE POLICY audit_log_admin_only ON audit_log
  FOR SELECT
  TO authenticated
  USING (current_setting('app.user_role', true)::text = 'admin');

-- Admins can only see logs in their regions
CREATE POLICY audit_log_region_isolation ON audit_log
  FOR SELECT
  TO authenticated
  USING (
    current_setting('app.user_role', true)::text = 'admin'
    AND region_id = ANY(string_to_array(current_setting('app.user_regions', true)::text, ','))
  );

-- System can insert audit logs (no SELECT policy needed for inserts)
CREATE POLICY audit_log_system_insert ON audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Comments
COMMENT ON POLICY audit_log_admin_only ON audit_log IS 'Only admins can view audit logs';
COMMENT ON POLICY audit_log_region_isolation ON audit_log IS 'Admins can only see logs in their regions';
COMMENT ON POLICY audit_log_system_insert ON audit_log IS 'System can insert audit log entries';
