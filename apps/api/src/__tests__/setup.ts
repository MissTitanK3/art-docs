/**
 * Test setup file
 * Runs before each test suite
 */

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.DATABASE_URL = 'postgres://dispatch_user:dispatch_password@localhost:5432/dispatch_db';
process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
