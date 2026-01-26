-- Create users table
-- Reference: /specs/database-schema#table-users
-- Sprint 0.5 Phase A Task 1

-- Create role enum type
CREATE TYPE user_role AS ENUM ('responder', 'admin', 'viewer');

-- Create users table
CREATE TABLE users (
  id VARCHAR(32) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'responder',
  allowed_regions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE users IS 'User accounts with roles and region permissions';
COMMENT ON COLUMN users.id IS 'Primary key, format: usr_<uuid>';
COMMENT ON COLUMN users.email IS 'User email address, unique';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hash of password, never store plain text';
COMMENT ON COLUMN users.role IS 'User role: responder, admin, or viewer';
COMMENT ON COLUMN users.allowed_regions IS 'Array of zip codes user can access, e.g. ["97201", "80202"]';
COMMENT ON COLUMN users.is_active IS 'Soft delete flag, FALSE = deleted';
