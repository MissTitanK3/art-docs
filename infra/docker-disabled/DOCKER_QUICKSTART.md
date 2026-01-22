# Quick Start with Docker

This project runs Next.js dev servers on the host and Postgres in Docker. Production deploys to Vercel with Supabase Postgres; Docker remains for local dev and future VM deployments.

## Windows (WSL 2) - Recommended

1. **Install Docker Desktop for Windows**
   - Download from [docker.com](https://www.docker.com/products/docker-desktop/)

2. **Enable WSL Integration**
   - Open Docker Desktop → Settings
   - Go to Resources → WSL Integration
   - Enable for your WSL distro (Ubuntu, etc.)
   - Apply & Restart

3. **Verify in WSL**

   ```bash
   docker --version
   docker compose version
   ```

4. **Start Postgres (dev)**

   ```bash
   cd /path/to/turbo
   docker compose up -d
   ```

5. **Start Next.js dev servers on the host**

   ```bash
   pnpm install
   pnpm dev:web
   pnpm dev:docs
   ```

   This starts the Next.js dev servers with hot reload.

## macOS / Linux

1. **Install Docker Desktop** (macOS) or **Docker Engine** (Linux)

2. **Start Postgres (dev)**

   ```bash
   cd /path/to/turbo
   docker compose up -d
   ```

3. **Start Next.js dev servers on the host**

   ```bash
   pnpm install
   pnpm dev:web
   pnpm dev:docs
   ```

   This starts the Next.js dev servers with hot reload.

## Services Available

- **Web App**: <http://localhost:3000>
- **Documentation**: <http://localhost:3001>
- **PostgreSQL**: localhost:5432

## Next Steps

- See `docs/deploy/vercel-supabase.md` for production deployment
- See `packages/migrations/README.md` for database management
