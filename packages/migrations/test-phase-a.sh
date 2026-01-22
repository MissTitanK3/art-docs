#!/bin/bash

# Sprint 0 Phase A: Database Setup Testing
# Tests the users and dispatches table creation

set -e

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

echo "🧪 Testing Sprint 0 Phase A Database Setup"
echo "=========================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable not set"
  echo ""
  echo "Please set DATABASE_URL, for example:"
  echo "export DATABASE_URL='postgres://user:password@localhost:5432/dispatch_db'"
  exit 1
fi

echo "✓ DATABASE_URL configured"
echo ""

# Test 1: Apply migrations
echo "Test 1: Applying migrations..."
cd /home/misstitank3/art/turbo/packages/migrations
npm run migrate 2>&1 || {
  echo "❌ Migration failed"
  exit 1
}
echo "✓ Migrations applied successfully"
echo ""

# Test 2: Load seed data
echo "Test 2: Loading seed data..."
psql "$DATABASE_URL" < migrations/fixtures/seed_test_data.sql 2>&1 || {
  echo "❌ Seed data failed"
  exit 1
}
echo "✓ Seed data loaded successfully"
echo ""

# Test 3: Query users table
echo "Test 3: Querying users table..."
USERS_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users;")
echo "   Found $USERS_COUNT users"
if [ "$USERS_COUNT" -lt 3 ]; then
  echo "❌ Expected at least 3 users"
  exit 1
fi
echo "✓ Users table populated"
echo ""

# Test 4: Query dispatches table
echo "Test 4: Querying dispatches table..."
DISPATCHES_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM dispatches;")
echo "   Found $DISPATCHES_COUNT dispatches"
if [ "$DISPATCHES_COUNT" -lt 3 ]; then
  echo "❌ Expected at least 3 dispatches"
  exit 1
fi
echo "✓ Dispatches table populated"
echo ""

# Test 5: Test foreign key relationships
echo "Test 5: Testing foreign key relationships..."
psql "$DATABASE_URL" -t -c "
  SELECT d.id, d.description, u.email 
  FROM dispatches d 
  JOIN users u ON d.submitter_id = u.id 
  LIMIT 1;
" > /dev/null 2>&1 || {
  echo "❌ Foreign key join failed"
  exit 1
}
echo "✓ Foreign key relationships working"
echo ""

# Test 6: Test indexes
echo "Test 6: Verifying indexes..."
IDX_COUNT=$(psql "$DATABASE_URL" -t -c "
  SELECT COUNT(*) 
  FROM pg_indexes 
  WHERE tablename IN ('users', 'dispatches');
")
echo "   Found $IDX_COUNT indexes"
if [ "$IDX_COUNT" -lt 8 ]; then
  echo "❌ Expected at least 8 indexes"
  exit 1
fi
echo "✓ Indexes created successfully"
echo ""

echo "=========================================="
echo "✅ All Phase A database tests passed!"
echo ""
echo "Next steps:"
echo "  - Backend can now implement API endpoints"
echo "  - Use seed data for testing auth and dispatch endpoints"
