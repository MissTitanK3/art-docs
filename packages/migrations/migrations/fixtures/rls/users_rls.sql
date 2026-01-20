-- Row Level Security policies for users table

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_select_admin ON users;
DROP POLICY IF EXISTS users_update_own ON users;
DROP POLICY IF EXISTS users_admin_all ON users;

-- Users can view their own record
CREATE POLICY users_select_own ON users
  FOR SELECT
  TO authenticated
  USING (id = current_setting('app.user_id', true)::text);

-- Admins can view all users in their regions
CREATE POLICY users_select_admin ON users
  FOR SELECT
  TO authenticated
  USING (
    current_setting('app.user_role', true)::text = 'admin'
    AND allowed_regions ?| string_to_array(current_setting('app.user_regions', true)::text, ',')
  );

-- Users can update their own non-role fields
CREATE POLICY users_update_own ON users
  FOR UPDATE
  TO authenticated
  USING (id = current_setting('app.user_id', true)::text)
  WITH CHECK (
    id = current_setting('app.user_id', true)::text
    AND role = OLD.role  -- Can't change own role
    AND allowed_regions = OLD.allowed_regions  -- Can't change own regions
  );

-- Admins can do anything
CREATE POLICY users_admin_all ON users
  FOR ALL
  TO authenticated
  USING (current_setting('app.user_role', true)::text = 'admin')
  WITH CHECK (current_setting('app.user_role', true)::text = 'admin');

-- Comments
COMMENT ON POLICY users_select_own ON users IS 'Users can view their own record';
COMMENT ON POLICY users_select_admin ON users IS 'Admins can view users in their regions';
COMMENT ON POLICY users_update_own ON users IS 'Users can update own record (except role/regions)';
COMMENT ON POLICY users_admin_all ON users IS 'Admins have full access';
