# Runtime Invariants

This document defines runtime expectations that must remain stable across deployment targets.

## Docker Compatibility Invariants

- Required scripts: `pnpm build`, `pnpm start`, `pnpm dev`.
- Required environment variables: `PORT`, `NODE_ENV`, `DB_DEFAULT_URL`, region-specific `DB_<REGION>_URL`, `JWT_SECRET`.
- Port binding: apps bind to `process.env.PORT` for `pnpm start`.
- Stateless runtime: no reliance on local filesystem writes or persistent disks.
- Networking: no assumptions about container-specific hostnames or internal service DNS.
