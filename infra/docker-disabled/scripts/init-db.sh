#!/bin/bash
# Initialize shadow database for migrations
# Runs as part of Docker entrypoint

set -e

echo "Initializing databases..."

# Create shadow database for migrations
PGPASSWORD=$POSTGRES_PASSWORD psql -h localhost -U $POSTGRES_USER -d $POSTGRES_DB -c "CREATE DATABASE ${POSTGRES_DB}_shadow;" 2>/dev/null || echo "Shadow database already exists"

echo "Database initialization complete"
