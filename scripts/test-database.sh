#!/bin/bash
# Database verification script for Sprint 0.5 Phase A
# Tests that all migrations were applied correctly

DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

echo "=================================="
echo "Sprint 0.5 Phase A: Database Tests"
echo "=================================="
echo ""

echo "✓ Testing table creation..."
TABLE_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")
echo "  Tables created: $TABLE_COUNT (expected: 4)"

echo ""
echo "✓ Testing enum types..."
ENUM_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM pg_type WHERE typtype = 'e';")
echo "  Enum types created: $ENUM_COUNT (expected: 8)"

echo ""
echo "✓ Testing seed data..."
USER_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM users;")
DISPATCH_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM dispatches;")
RESPONDER_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM responders;")
AUDIT_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM audit_log;")

echo "  Users: $USER_COUNT (expected: 5)"
echo "  Dispatches: $DISPATCH_COUNT (expected: 5)"
echo "  Responders: $RESPONDER_COUNT (expected: 2)"
echo "  Audit log entries: $AUDIT_COUNT (expected: 4)"

echo ""
echo "✓ Testing constraints..."

# Test latitude constraint
echo -n "  Latitude validation: "
if psql "$DB_URL" -t -c "INSERT INTO dispatches (id, region_id, submitter_id, location_lat, location_lon, description) VALUES ('test_1', 'us-west-1', 'usr_admin_001', 100, 0, 'test');" 2>&1 | grep -q "violates check constraint"; then
    echo "✓ PASS (invalid latitude rejected)"
else
    echo "✗ FAIL (invalid latitude accepted)"
fi

# Test unique constraint on client_id
echo -n "  Client ID idempotency: "
psql "$DB_URL" -t -c "INSERT INTO dispatches (id, region_id, submitter_id, client_id, location_lat, location_lon) VALUES ('test_2', 'us-west-1', 'usr_admin_001', 'client_001', 45.5, -122.6);" 2>&1 > /dev/null
if psql "$DB_URL" -t -c "SELECT id FROM dispatches WHERE id = 'test_2';" | grep -q "test_2"; then
    echo "✗ FAIL (duplicate client_id allowed)"
else
    echo "✓ PASS (duplicate client_id prevented)"
fi

# Clean up test data
psql "$DB_URL" -t -c "DELETE FROM dispatches WHERE id LIKE 'test_%';" > /dev/null 2>&1

echo ""
echo "✓ Testing audit log immutability..."
if psql "$DB_URL" -t -c "UPDATE audit_log SET event_type = 'dispatch_created' WHERE id = 1;" 2>&1 | grep -q "immutable"; then
    echo "  ✓ PASS (UPDATE prevented)"
else
    echo "  ✗ FAIL (UPDATE allowed)"
fi

if psql "$DB_URL" -t -c "DELETE FROM audit_log WHERE id = 1;" 2>&1 | grep -q "immutable"; then
    echo "  ✓ PASS (DELETE prevented)"
else
    echo "  ✗ FAIL (DELETE allowed)"
fi

echo ""
echo "✓ Testing indexes..."
INDEX_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';")
echo "  Indexes created: $INDEX_COUNT (expected: ~26)"

echo ""
echo "=================================="
echo "All tests completed!"
echo "=================================="
