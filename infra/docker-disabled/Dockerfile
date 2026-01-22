# DO NOT USE FOR PRODUCTION
# Kept for historical reference only.
# Multi-stage Dockerfile for Next.js applications in monorepo
# Builds both web and docs applications

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.0.0
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# ============================================================================
# DEPENDENCIES STAGE
# ============================================================================
FROM base AS deps
WORKDIR /app

# Copy monorepo files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages packages
COPY turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/docs/package.json apps/docs/package.json

# Install dependencies
RUN pnpm install --frozen-lockfile

# ============================================================================
# BUILDER STAGE
# ============================================================================
FROM base AS builder
WORKDIR /app

# Copy from deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-workspace.yaml ./
COPY --from=deps /app/pnpm-lock.yaml ./
COPY --from=deps /app/package.json ./
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/turbo.json ./
COPY --from=deps /app/apps ./apps

# Copy all app source code
COPY apps apps

# Build the specified app (passed as build arg)
ARG APP=web
RUN pnpm --filter "${APP}" build

# ============================================================================
# RUNTIME STAGE
# ============================================================================
FROM base AS runtime

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Set app argument (default to web)
ARG APP=web
ENV APP_NAME=${APP}

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP}/.next ./apps/${APP}/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP}/public ./apps/${APP}/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP}/package.json ./apps/${APP}/package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP}/node_modules ./apps/${APP}/node_modules

# Copy necessary workspace files
COPY --chown=nextjs:nodejs package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy minimal structure for runtime
COPY --from=builder --chown=nextjs:nodejs /app/packages ./packages

# Stay at /app for workspace root access
# WORKDIR /app

# Expose port
EXPOSE 3000

# Set user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Change to app directory and start Next.js directly
# Shell form needed for variable expansion
CMD cd apps/${APP_NAME} && exec node ../../node_modules/.bin/next start -p 3000
