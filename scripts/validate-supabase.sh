#!/usr/bin/env bash

# Supabase Setup Validation Script
# Checks that Supabase is properly configured for the monorepo

set -e

echo "🔍 Supabase Setup Validation"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

check() {
  local name=$1
  local condition=$2
  
  if eval "$condition"; then
    echo -e "${GREEN}✓${NC} $name"
  else
    echo -e "${RED}✗${NC} $name"
    ERRORS=$((ERRORS + 1))
  fi
}

warn() {
  local name=$1
  local condition=$2
  
  if ! eval "$condition"; then
    echo -e "${YELLOW}⚠${NC} $name"
    WARNINGS=$((WARNINGS + 1))
  fi
}

echo "📂 Directory Structure"
check "supabase/ exists" "[ -d supabase ]"
check "supabase/config.toml exists" "[ -f supabase/config.toml ]"
check "supabase/migrations/ exists" "[ -d supabase/migrations ]"
check "supabase/seed.sql exists" "[ -f supabase/seed.sql ]"
check "supabase/functions/ exists" "[ -d supabase/functions ]"
echo ""

echo "📦 Dependencies"
check "Supabase CLI installed" "pnpm exec supabase --version > /dev/null 2>&1"
check "@supabase/supabase-js in apps/web" "grep -q '@supabase/supabase-js' apps/web/package.json"
check "@supabase/supabase-js in apps/docs" "grep -q '@supabase/supabase-js' apps/docs/package.json"
echo ""

echo "⚙️ Environment Variables"
check "apps/web/.env.local exists" "[ -f apps/web/.env.local ]"
check "apps/web has NEXT_PUBLIC_SUPABASE_URL" "grep -q 'NEXT_PUBLIC_SUPABASE_URL' apps/web/.env.local"
check "apps/web has NEXT_PUBLIC_SUPABASE_ANON_KEY" "grep -q 'NEXT_PUBLIC_SUPABASE_ANON_KEY' apps/web/.env.local"
check "apps/docs/.env.local exists" "[ -f apps/docs/.env.local ]"
check "apps/docs has NEXT_PUBLIC_SUPABASE_URL" "grep -q 'NEXT_PUBLIC_SUPABASE_URL' apps/docs/.env.local"
check "apps/docs has NEXT_PUBLIC_SUPABASE_ANON_KEY" "grep -q 'NEXT_PUBLIC_SUPABASE_ANON_KEY' apps/docs/.env.local"
echo ""

echo "🔧 Client Configuration"
check "apps/web/lib/supabase-client.ts exists" "[ -f apps/web/lib/supabase-client.ts ]"
check "apps/docs/lib/supabase-client.ts exists" "[ -f apps/docs/lib/supabase-client.ts ]"
echo ""

echo "📚 Documentation"
check "SUPABASE_SETUP.md exists" "[ -f SUPABASE_SETUP.md ]"
check "MIGRATIONS_STRATEGY.md exists" "[ -f MIGRATIONS_STRATEGY.md ]"
echo ""

echo "📋 NPM Scripts"
check "dev:infra script exists" "grep -q 'dev:infra' package.json"
check "db:reset script exists" "grep -q 'db:reset' package.json"
check "db:stop script exists" "grep -q 'db:stop' package.json"
echo ""

echo "✅ Validation Complete"
echo "=============================="
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}No errors found!${NC}"
else
  echo -e "${RED}Found $ERRORS error(s)${NC}"
fi

if [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}Found $WARNINGS warning(s)${NC}"
fi

echo ""
echo "📖 Next Steps:"
echo "1. Ensure Docker is installed and running"
echo "2. Run: pnpm dev:infra"
echo "3. Update .env.local files with credentials from: pnpm exec supabase status"
echo "4. Run: pnpm dev"
echo ""

exit $ERRORS
