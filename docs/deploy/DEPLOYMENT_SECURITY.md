# Deployment Security Checklist

**Last Updated:** 2026-01-26  
**Sprint:** Sprint 1 - Security Hardening

---

## Required Environment Variables

### JWT_SECRET (CRITICAL)

**Status:** 🔴 **REQUIRED** - Application will fail to start in production without this

**Purpose:** Secret key for signing JWT authentication tokens

**Generation:**
```bash
# Generate a secure 32-byte random secret
openssl rand -base64 32
```

**Example:**
```bash
# .env.production or deployment platform environment variables
JWT_SECRET=your-generated-secret-here-32-chars-minimum
```

**Security Requirements:**
- ✅ Minimum 32 bytes (256 bits)
- ✅ Randomly generated (cryptographically secure)
- ✅ Never commit to source control
- ✅ Rotate annually or on suspected compromise
- ✅ Unique per environment (staging, production)

**Failure Behavior:**
```
If JWT_SECRET is not set in production:
❌ Application will exit with error:
   "JWT_SECRET environment variable is required in production.
    Generate a secure secret: openssl rand -base64 32"
```

### Database Connection

**NEXT_PUBLIC_SUPABASE_URL**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

**NEXT_PUBLIC_SUPABASE_ANON_KEY**
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**SUPABASE_SERVICE_ROLE_KEY** (server-side only)
```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Security Configuration

### Authentication Settings

**JWT Token Expiry:** 1 hour
```typescript
// Configured in: apps/web/lib/auth.ts
const JWT_EXPIRY = "1h";
```

**Token Refresh Strategy:**
- Frontend checks token every 15 minutes
- Refreshes if expiring within 5 minutes
- Endpoint: `GET /api/auth/session`
- See: [Token Refresh Implementation](#token-refresh)

**Password Hashing:**
- Algorithm: bcrypt
- Cost factor: 12
- Expected time: 100-600ms per hash

```typescript
// Configured in: apps/web/lib/auth.ts
bcrypt.hash(password, 12);
```

**Session Cookies:**
- HttpOnly: ✅ Yes (prevents XSS)
- Secure: ✅ Yes in production (HTTPS only)
- SameSite: `strict` (prevents CSRF)
- MaxAge: 3600 seconds (1 hour)

---

## Token Refresh

### Automatic Refresh Flow

**Client-Side Implementation:**

1. **Setup** - Add TokenRefreshProvider to app layout:
```tsx
// app/layout.tsx
import { TokenRefreshProvider } from "@/components/auth/TokenRefreshProvider";

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <TokenRefreshProvider>
        {children}
      </TokenRefreshProvider>
    </AuthProvider>
  );
}
```

2. **Behavior:**
   - Checks session every 15 minutes
   - Calls `GET /api/auth/session`
   - If token expires in < 5 minutes, server returns new token
   - Auto-logout on refresh failure

**Manual Usage:**

```tsx
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

function MyComponent() {
  const { refreshToken, lastRefresh } = useTokenRefresh({
    enabled: isAuthenticated,
    intervalMinutes: 15,
    onRefreshSuccess: (data) => {
      console.log('Token refreshed:', data.expires_at);
    },
    onRefreshError: (error) => {
      // Handle logout
      handleLogout();
    },
  });

  return <div>Last refresh: {lastRefresh?.toISOString()}</div>;
}
```

### API Endpoint

**GET /api/auth/session**

**Headers:**
```
Cookie: auth_token=<jwt>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "role": "responder",
    "allowed_regions": ["97201", "80202"]
  },
  "token": "new-jwt-if-refreshed",
  "expires_at": "2026-01-26T15:00:00Z",
  "refreshed": true
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Invalid or expired token"
}
```

---

## Performance Testing

### Password Hashing Performance

**Test Script:**
```bash
node scripts/test-password-performance.js
```

**Expected Results (bcrypt cost 12):**
- Average: 100-600ms per hash
- Target: < 300ms for good UX
- Verification: Similar timing

**Performance Monitoring:**

Monitor in production:
```typescript
// Example login timing
const start = Date.now();
await bcrypt.compare(password, hash);
const duration = Date.now() - start;

// Log if slow
if (duration > 500) {
  console.warn('Slow password verification:', duration);
}
```

**Cost Factor Comparison:**
- Cost 10: ~100-150ms (less secure)
- Cost 12: ~400-600ms (recommended, 4x slower)
- Cost 13: ~800-1200ms (very secure, 8x slower)

**Recommendation:** Cost 12 is the industry standard for 2026 and provides good balance.

---

## Pre-Deployment Checklist

### Environment Setup

- [ ] JWT_SECRET generated and set in production environment
- [ ] JWT_SECRET unique per environment (not shared between staging/prod)
- [ ] Database connection strings configured
- [ ] HTTPS enabled (required for secure cookies)
- [ ] NODE_ENV set to "production"

### Security Verification

- [ ] Test login with production JWT_SECRET
- [ ] Verify tokens expire after 1 hour
- [ ] Test token refresh flow (GET /api/auth/session)
- [ ] Verify cookies have HttpOnly, Secure, SameSite=strict
- [ ] Test password hashing performance (< 500ms acceptable)
- [ ] Verify CORS configuration
- [ ] Rate limiting on /auth/login (5 attempts per 15 min) - TODO Sprint 2

### Monitoring Setup

- [ ] Log failed login attempts
- [ ] Monitor token refresh errors
- [ ] Track password hashing times
- [ ] Alert on high error rates (> 2%)
- [ ] Alert on slow response times (> 5s)

---

## Common Issues

### "JWT_SECRET environment variable is required"

**Cause:** JWT_SECRET not set in production environment

**Fix:**
```bash
# Generate secret
openssl rand -base64 32

# Set in your deployment platform
# Vercel: Settings → Environment Variables
# Render: Environment → Add Variable
# Railway: Variables → New Variable
```

### "Token expired" errors immediately after login

**Cause:** Token expiry mismatch or clock skew

**Check:**
1. Verify JWT_EXPIRY is "1h"
2. Check server time: `date`
3. Verify cookie maxAge matches: 3600 seconds

### Slow login performance

**Cause:** High bcrypt cost factor

**Diagnosis:**
```bash
# Run performance test
node scripts/test-password-performance.js
```

**Fix:** If average > 500ms, consider reducing cost to 11 (though 12 is recommended)

---

## Security Updates

### Rotate JWT_SECRET

**When:**
- Annually (scheduled)
- On suspected compromise
- After security incident

**Process:**
1. Generate new secret: `openssl rand -base64 32`
2. Update in deployment environment
3. Deploy new version
4. All users will need to re-login (tokens invalidated)

**Graceful Rotation (Advanced):**
```typescript
// Support old and new secrets temporarily
const JWT_SECRETS = [
  process.env.JWT_SECRET,
  process.env.JWT_SECRET_OLD, // Keep for 24h during rotation
].filter(Boolean);
```

---

## References

- [Authentication Architecture](/specs/authentication-architecture)
- [Backend API Contracts](/specs/backend-api-contracts)
- [Sprint 1 Roadmap](/roadmap/sprint_1/sprint_1)

**Security Team Contact:** security@dispatch.example.com  
**Last Security Review:** 2026-01-26
