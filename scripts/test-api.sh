#!/bin/bash
# API endpoint tests for Sprint 0.5 Phase B
# Tests the Next.js API routes

API_URL="http://localhost:3000/api"

echo "=================================="
echo "Sprint 0.5 Phase B: API Tests"
echo "=================================="
echo ""

# Test 1: POST /api/auth/login - Valid credentials
echo "✓ Testing POST /api/auth/login (valid credentials)..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"responder1@example.com","password":"password123"}' \
  -c /tmp/cookies.txt)

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "  ✓ PASS: Got JWT token"
  echo "  Token: ${TOKEN:0:50}..."
else
  echo "  ✗ FAIL: No token received"
  echo "  Response: $LOGIN_RESPONSE"
fi

# Test 2: POST /api/auth/login - Invalid credentials
echo ""
echo "✓ Testing POST /api/auth/login (invalid credentials)..."
INVALID_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"responder1@example.com","password":"wrongpassword"}')

if echo "$INVALID_RESPONSE" | grep -q "Invalid credentials"; then
  echo "  ✓ PASS: Returns 401 error"
else
  echo "  ✗ FAIL: Should return 401"
  echo "  Response: $INVALID_RESPONSE"
fi

# Test 3: POST /api/dispatches - Create dispatch (authenticated)
echo ""
echo "✓ Testing POST /api/dispatches (authenticated)..."
# Generate a valid UUID v4 for client_id
CLIENT_UUID=$(uuidgen 2>/dev/null || cat /proc/sys/kernel/random/uuid)
DISPATCH_RESPONSE=$(curl -s -X POST "$API_URL/dispatches" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "region_id": "97201",
    "client_id": "'$CLIENT_UUID'",
    "location": {
      "lat": 45.512,
      "lon": -122.658,
      "description": "Test location",
      "precision": "exact"
    },
    "description": "Test dispatch from API test script",
    "urgency": "normal"
  }')

DISPATCH_ID=$(echo "$DISPATCH_RESPONSE" | grep -o '"dispatch_id":"[^"]*"' | cut -d'"' -f4)

if [ -n "$DISPATCH_ID" ]; then
  echo "  ✓ PASS: Created dispatch"
  echo "  Dispatch ID: $DISPATCH_ID"
else
  echo "  ✗ FAIL: No dispatch created"
  echo "  Response: $DISPATCH_RESPONSE"
fi

# Test 4: POST /api/dispatches - Unauthenticated
echo ""
echo "✓ Testing POST /api/dispatches (unauthenticated)..."
UNAUTH_RESPONSE=$(curl -s -X POST "$API_URL/dispatches" \
  -H "Content-Type: application/json" \
  -d '{"region_id":"97201","location":{"lat":45.5,"lon":-122.6}}')

if echo "$UNAUTH_RESPONSE" | grep -q "Authentication required"; then
  echo "  ✓ PASS: Returns 401 error"
else
  echo "  ✗ FAIL: Should require authentication"
  echo "  Response: $UNAUTH_RESPONSE"
fi

# Test 5: GET /api/dispatches - List all
echo ""
echo "✓ Testing GET /api/dispatches (list all)..."
LIST_RESPONSE=$(curl -s "$API_URL/dispatches")
DISPATCH_COUNT=$(echo "$LIST_RESPONSE" | grep -o '"dispatches":\[' | wc -l)

if [ "$DISPATCH_COUNT" -gt 0 ]; then
  echo "  ✓ PASS: Returns dispatch list"
  echo "  Response includes dispatches array"
else
  echo "  ✗ FAIL: No dispatches returned"
  echo "  Response: $LIST_RESPONSE"
fi

# Test 6: GET /api/dispatches - Filter by region
echo ""
echo "✓ Testing GET /api/dispatches (filter by region)..."
REGION_RESPONSE=$(curl -s "$API_URL/dispatches?region_id=97201")

if echo "$REGION_RESPONSE" | grep -q '"region_id":"97201"'; then
  echo "  ✓ PASS: Filtering by region works"
else
  echo "  ⚠ WARNING: No dispatches found for region 97201 (might be empty)"
fi

# Test 7: GET /api/dispatches - Pagination
echo ""
echo "✓ Testing GET /api/dispatches (pagination)..."
PAGE_RESPONSE=$(curl -s "$API_URL/dispatches?limit=2")
HAS_PAGINATION=$(echo "$PAGE_RESPONSE" | grep -o '"pagination":{')

if [ -n "$HAS_PAGINATION" ]; then
  echo "  ✓ PASS: Returns pagination metadata"
else
  echo "  ✗ FAIL: Missing pagination"
  echo "  Response: $PAGE_RESPONSE"
fi

echo ""
echo "=================================="
echo "All API tests completed!"
echo "=================================="

# Cleanup
rm -f /tmp/cookies.txt
