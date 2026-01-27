# API Error Response Standards

**Status:** ✅ Implemented  
**Date:** 2026-01-26  
**Scope:** Sprint 1 - All dispatch endpoints

---

## Error Response Format

All API error responses follow a standardized format with the following fields:

```json
{
  "error": "Human-readable error message",
  "error_code": "MACHINE_READABLE_CODE",
  "status_code": 400,
  "details": {}  // Optional: additional context
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `error` | string | Yes | Human-readable error message for users/developers |
| `error_code` | string | Yes | Machine-readable error identifier for programmatic handling |
| `status_code` | number | Yes | HTTP status code (mirrors HTTP response status) |
| `details` | object | No | Additional context (e.g., validation errors, field-specific issues) |

---

## Error Codes Reference

### Authentication Errors (401)

| Code | Meaning | When Used | Recovery |
|------|---------|-----------|----------|
| `MISSING_TOKEN` | No authentication token provided | Missing `Authorization` header and `auth_token` cookie | Provide valid token in header or cookie |
| `INVALID_TOKEN` | Token is invalid, expired, or malformed | Token fails verification (JWT invalid, expired) | Re-authenticate to get new token |

### Validation Errors (400, 422)

| Code | Meaning | When Used | Recovery |
|------|---------|-----------|----------|
| `VALIDATION_ERROR` | Request body fails schema validation | Required fields missing, wrong types, out of range | Fix request body and retry |

### Authorization Errors (403)

| Code | Meaning | When Used | Recovery |
|------|---------|-----------|----------|
| `REGION_ACCESS_DENIED` | User lacks access to specified region | User's allowed_regions doesn't include requested region_id | Use an allowed region |

### Server Errors (500)

| Code | Meaning | When Used | Recovery |
|------|---------|-----------|----------|
| `DATABASE_ERROR` | Database operation failed | Supabase insert/update/delete fails | Retry request; contact support if persists |
| `INTERNAL_ERROR` | Unexpected internal error | Uncaught exception in request handler | Retry request; contact support if persists |

---

## Examples

### Example: Authentication Error (401)

**Request:**
```bash
curl -X POST http://localhost:3000/api/dispatches \
  -H "Content-Type: application/json" \
  -d '{"region_id": "97201", "location": {"lat": 40.7, "lon": -74.0}}'
```

**Response:**
```json
{
  "error": "Authentication required",
  "error_code": "MISSING_TOKEN",
  "status_code": 401
}
```

---

### Example: Validation Error (422)

**Request:**
```bash
curl -X POST http://localhost:3000/api/dispatches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer valid_token" \
  -d '{
    "region_id": "97201",
    "location": {"lat": 100, "lon": -74.0},
    "urgency": "invalid_value"
  }'
```

**Response:**
```json
{
  "error": "Invalid request",
  "error_code": "VALIDATION_ERROR",
  "status_code": 422,
  "details": [
    {
      "code": "too_big",
      "maximum": 90,
      "type": "number",
      "path": ["location", "lat"],
      "message": "Number must be less than or equal to 90"
    },
    {
      "code": "invalid_enum_value",
      "options": ["low", "normal", "critical"],
      "path": ["urgency"],
      "message": "Invalid enum value. Expected 'low' | 'normal' | 'critical'"
    }
  ]
}
```

---

### Example: Authorization Error (403)

**Request:**
```bash
curl -X POST http://localhost:3000/api/dispatches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer valid_token" \
  -d '{
    "region_id": "12345",
    "location": {"lat": 40.7, "lon": -74.0},
    "description": "test",
    "urgency": "normal"
  }'
```

**Response:**
```json
{
  "error": "Access denied to this region",
  "error_code": "REGION_ACCESS_DENIED",
  "status_code": 403
}
```

---

### Example: Server Error (500)

**Response (when database is unavailable):**
```json
{
  "error": "Failed to create dispatch",
  "error_code": "DATABASE_ERROR",
  "status_code": 500
}
```

---

## Client Handling Recommendations

### TypeScript/JavaScript

```typescript
// Handle API errors with error_code
try {
  const response = await fetch('/api/dispatches', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    
    switch (error.error_code) {
      case 'MISSING_TOKEN':
      case 'INVALID_TOKEN':
        // Redirect to login
        window.location.href = '/auth/login';
        break;
      
      case 'VALIDATION_ERROR':
        // Show field-specific errors
        showValidationErrors(error.details);
        break;
      
      case 'REGION_ACCESS_DENIED':
        // Show region selection UI
        showRegionSelector();
        break;
      
      case 'DATABASE_ERROR':
      case 'INTERNAL_ERROR':
        // Show retry button
        showRetryButton();
        break;
      
      default:
        showGenericError(error.error);
    }
  }
} catch (err) {
  showNetworkError();
}
```

---

## Structured Request Logging

### Log Format

All API requests are logged in JSON format via `logAPIEvent()`:

```json
{
  "timestamp": "2026-01-26T15:30:45.123Z",
  "method": "POST",
  "path": "/api/dispatches",
  "user_id": "user_abc123",
  "region_id": "97201",
  "dispatch_id": "dsp_abc123def456",
  "status_code": 201,
  "duration_ms": 145,
  "event_type": "dispatch_created",
  "urgency": "normal",
  "location_precision": "exact",
  "idempotent": false,
  "environment": "production"
}
```

### Error Log Format

```json
{
  "timestamp": "2026-01-26T15:31:10.456Z",
  "method": "POST",
  "path": "/api/dispatches",
  "user_id": "user_abc123",
  "region_id": "97201",
  "status_code": 422,
  "duration_ms": 12,
  "event_type": "api_error",
  "error": "Validation failed",
  "error_type": "validation",
  "error_details": [
    { "code": "invalid_enum_value", "path": ["urgency"] }
  ],
  "environment": "production"
}
```

### Log Fields

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | ISO 8601 | When the request was received |
| `method` | string | HTTP method (POST, GET, etc.) |
| `path` | string | Request path (/api/dispatches, etc.) |
| `user_id` | string | ID of authenticated user (if applicable) |
| `region_id` | string | Region being accessed (if applicable) |
| `dispatch_id` | string | Created/modified dispatch ID (if applicable) |
| `status_code` | number | HTTP response status code |
| `duration_ms` | number | Request duration in milliseconds |
| `event_type` | string | Type of event (dispatch_created, api_error, etc.) |
| `error_type` | string | Category of error (validation, auth, database, internal) |
| `environment` | string | Deployment environment (development, production) |

### Monitoring & Alerting

**Recommended Thresholds:**

- **Error rate > 2%** (across all requests in 5-minute window) → Page on-call
- **Database errors in last 10 minutes** → Alert engineering
- **Auth errors from same IP > 10 in 1 minute** → Potential attack
- **Request duration > 5 seconds** → Performance alert

---

## Implementation Checklist

- ✅ All error responses include `error_code` field
- ✅ Error codes are machine-readable (UPPER_SNAKE_CASE)
- ✅ All errors logged via `logAPIEvent()` with structured JSON
- ✅ Validation errors include `details` array
- ✅ Log includes `duration_ms` for performance tracking
- ✅ Log includes `user_id` and `region_id` when available
- ✅ Structured logging supports JSON log aggregation

---

## Future Enhancements

- **Sprint 2:** Add alerting rules to log aggregator (Datadog/New Relic)
- **Sprint 2:** Create dashboard for error rate by error_code
- **Sprint 3:** Implement distributed tracing (request correlation IDs)
- **Sprint 3:** Add metrics export (Prometheus format)

---

**Last Updated:** 2026-01-26  
**Owner:** Backend Team  
**Status:** ✅ Complete
