-- afterReset.sql
-- Runs after database is reset (development only)
-- Use for setting up extensions, permissions, or initial configuration

-- Install extensions
\i migrations/fixtures/extensions.sql

-- Create custom types
\i migrations/fixtures/types/enums.sql

-- Set up default permissions if needed
-- GRANT USAGE ON SCHEMA public TO authenticated;
-- GRANT CREATE ON SCHEMA public TO authenticated;

-- Configure PostgreSQL settings
ALTER DATABASE :DATABASE_NAME SET timezone TO 'UTC';
