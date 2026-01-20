#!/bin/sh
# Dumps database schema for git tracking and review

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable not set"
  exit 1
fi

# Create output directory if it doesn't exist
mkdir -p migrations/schema-dumps

# Generate filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SCHEMA_FILE="migrations/schema-dumps/schema_$TIMESTAMP.sql"
LATEST_FILE="migrations/schema-dumps/schema_latest.sql"

# Dump schema only (no data, no owner, exclude graphile_migrate schema)
pg_dump \
  --schema-only \
  --no-owner \
  --no-privileges \
  --exclude-schema=graphile_migrate \
  --file="$SCHEMA_FILE" \
  "$DATABASE_URL"

# Copy to latest
cp "$SCHEMA_FILE" "$LATEST_FILE"

echo "✅ Schema dumped to:"
echo "   - $SCHEMA_FILE"
echo "   - $LATEST_FILE"
echo ""
echo "💡 Review schema changes with: git diff $LATEST_FILE"
