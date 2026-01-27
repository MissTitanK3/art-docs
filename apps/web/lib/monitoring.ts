/**
 * API Monitoring and Logging Utilities
 *
 * Provides structured logging for API requests and error tracking
 * Sprint 1 - API Monitoring Implementation
 */

export interface APILogEvent {
  timestamp: string;
  method: string;
  path: string;
  user_id?: string;
  region_id?: string;
  status_code: number;
  duration_ms?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface DispatchCreatedEvent extends APILogEvent {
  event_type: "dispatch_created";
  dispatch_id: string;
  urgency: string;
  location_precision: string;
  idempotent: boolean;
}

export interface APIErrorEvent extends APILogEvent {
  event_type: "api_error";
  error_type: "validation" | "auth" | "database" | "internal";
  error_details?: unknown;
}

/**
 * Logs API requests in structured JSON format for monitoring
 *
 * @param event - The event to log
 */
export function logAPIEvent(
  event: APILogEvent | DispatchCreatedEvent | APIErrorEvent
): void {
  const logData = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  };

  // In production, this would send to a monitoring service (e.g., Datadog, New Relic)
  // For now, we'll use structured console.log that can be parsed by log aggregators
  console.log(JSON.stringify(logData));

  // Track error rates for alerting
  if ("event_type" in event && event.event_type === "api_error") {
    trackErrorRate(event);
  }
}

/**
 * Tracks API error rates and logs alerts if threshold exceeded
 *
 * Simple in-memory tracking. In production, use Redis or similar.
 */
const errorCounts = new Map<string, number[]>();
const ERROR_RATE_THRESHOLD = 0.02; // 2%
const TRACKING_WINDOW_MS = 60000; // 1 minute

function trackErrorRate(errorEvent: APIErrorEvent): void {
  const key = `${errorEvent.method}:${errorEvent.path}`;
  const now = Date.now();

  if (!errorCounts.has(key)) {
    errorCounts.set(key, []);
  }

  const timestamps = errorCounts.get(key)!;

  // Add current error
  timestamps.push(now);

  // Remove errors outside tracking window
  const recentErrors = timestamps.filter((ts) => now - ts < TRACKING_WINDOW_MS);
  errorCounts.set(key, recentErrors);

  // Alert if error rate exceeds threshold
  // This is a simplified check - in production, compare against total requests
  if (recentErrors.length >= 10) {
    console.error(
      JSON.stringify({
        alert: "HIGH_ERROR_RATE",
        endpoint: key,
        error_count: recentErrors.length,
        window_ms: TRACKING_WINDOW_MS,
        threshold: ERROR_RATE_THRESHOLD,
        timestamp: new Date().toISOString(),
      })
    );
  }
}

/**
 * Measures request duration for performance monitoring
 *
 * @example
 * const timer = measureDuration();
 * // ... do work ...
 * logAPIEvent({ ...event, duration_ms: timer.end() });
 */
export function measureDuration(): { end: () => number } {
  const start = performance.now();
  return {
    end: () => Math.round(performance.now() - start),
  };
}

/**
 * Sanitizes sensitive data from logs
 *
 * @param data - The data to sanitize
 * @returns Sanitized data safe for logging
 */
export function sanitizeForLogging(
  data: Record<string, unknown>
): Record<string, unknown> {
  const sensitiveFields = [
    "password",
    "token",
    "authorization",
    "api_key",
    "secret",
  ];
  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = "[REDACTED]";
    }
  }

  return sanitized;
}

/**
 * Creates a standardized error response with logging
 *
 * @param error - The error object
 * @param context - Additional context for logging
 * @returns NextResponse with error details
 */
export function createErrorResponse(
  error: unknown,
  context: {
    method: string;
    path: string;
    user_id?: string;
    status_code: number;
  }
): { error: string; status: number } {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";

  logAPIEvent({
    event_type: "api_error",
    timestamp: new Date().toISOString(),
    method: context.method,
    path: context.path,
    user_id: context.user_id,
    status_code: context.status_code,
    error: errorMessage,
    error_type: getErrorType(context.status_code),
  } as APIErrorEvent);

  return {
    error: getPublicErrorMessage(context.status_code),
    status: context.status_code,
  };
}

function getErrorType(statusCode: number): APIErrorEvent["error_type"] {
  if (statusCode === 401 || statusCode === 403) return "auth";
  if (statusCode === 422 || statusCode === 400) return "validation";
  if (statusCode === 500) return "internal";
  return "internal";
}

function getPublicErrorMessage(statusCode: number): string {
  switch (statusCode) {
    case 401:
      return "Authentication required";
    case 403:
      return "Access denied";
    case 422:
      return "Invalid request";
    case 500:
      return "Internal server error";
    default:
      return "An error occurred";
  }
}
