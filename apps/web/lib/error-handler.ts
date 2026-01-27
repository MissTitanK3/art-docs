/**
 * Error Handler Utility
 * Maps API error codes to user-friendly messages and recovery actions
 * Follows approved language and accessibility standards
 */

export type ErrorCode =
  | "MISSING_TOKEN"
  | "INVALID_TOKEN"
  | "VALIDATION_ERROR"
  | "REGION_ACCESS_DENIED"
  | "DATABASE_ERROR"
  | "INTERNAL_ERROR"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

export type RecoveryAction =
  | "sign-in"
  | "retry"
  | "change-region"
  | "contact-support";

export interface ErrorContext {
  error_code: ErrorCode;
  error: string;
  status_code?: number;
  details?: unknown;
}

export interface ParsedError {
  code: ErrorCode;
  message: string;
  actionLabel: string;
  recoveryActions: RecoveryAction[];
  isRetryable: boolean;
  isAuthError: boolean;
}

/**
 * Parse API error response into structured error context
 */
export function parseApiError(error: unknown): ErrorContext {
  if (error instanceof Error) {
    // Network error
    if (
      error.message.includes("Failed to fetch") ||
      error.message.includes("Network")
    ) {
      return {
        error_code: "NETWORK_ERROR",
        error: "Connection lost. Check your internet and try again.",
      };
    }
    return {
      error_code: "UNKNOWN_ERROR",
      error: error.message,
    };
  }

  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    return {
      error_code: (err.error_code as ErrorCode) || "UNKNOWN_ERROR",
      error: (err.error as string) || "Something went wrong. Please try again.",
      status_code: err.status_code as number,
      details: err.details,
    };
  }

  return {
    error_code: "UNKNOWN_ERROR",
    error: "Something went wrong. Please try again.",
  };
}

/**
 * Convert error context into user-friendly messaging with recovery actions
 */
export function getErrorGuidance(context: ErrorContext): ParsedError {
  const { error_code, error } = context;

  // Auth errors
  if (error_code === "MISSING_TOKEN" || error_code === "INVALID_TOKEN") {
    return {
      code: error_code,
      message: "Your session expired. Please sign in again to send a report.",
      actionLabel: "Sign in",
      recoveryActions: ["sign-in"],
      isRetryable: false,
      isAuthError: true,
    };
  }

  // Validation errors (user can fix and retry)
  if (error_code === "VALIDATION_ERROR") {
    return {
      code: "VALIDATION_ERROR",
      message:
        "We couldn't send your report—please check your location and try again. Make sure latitude is between -90 and 90, and longitude is between -180 and 180.",
      actionLabel: "Fix and retry",
      recoveryActions: ["retry"],
      isRetryable: true,
      isAuthError: false,
    };
  }

  // Region access error
  if (error_code === "REGION_ACCESS_DENIED") {
    return {
      code: "REGION_ACCESS_DENIED",
      message:
        "You don't have access to send reports in that region. Please select a different area or check with your administrator.",
      actionLabel: "Change region",
      recoveryActions: ["change-region"],
      isRetryable: false,
      isAuthError: false,
    };
  }

  // Server errors (retryable, may need support)
  if (error_code === "DATABASE_ERROR" || error_code === "INTERNAL_ERROR") {
    const dispatchId =
      (context.details as Record<string, unknown> | undefined)?.dispatch_id ||
      "reference";
    return {
      code: error_code,
      message: `Our servers are experiencing issues. We've saved your report (${dispatchId}) and will try again. Please refresh or try again in a moment.`,
      actionLabel: "Retry",
      recoveryActions: ["retry", "contact-support"],
      isRetryable: true,
      isAuthError: false,
    };
  }

  // Network errors
  if (error_code === "NETWORK_ERROR") {
    return {
      code: "NETWORK_ERROR",
      message: "No connection. Check your internet and try again.",
      actionLabel: "Retry",
      recoveryActions: ["retry"],
      isRetryable: true,
      isAuthError: false,
    };
  }

  // Unknown errors
  return {
    code: "UNKNOWN_ERROR",
    message:
      error ||
      "Something unexpected happened. Please try again or contact support if the problem persists.",
    actionLabel: "Retry",
    recoveryActions: ["retry", "contact-support"],
    isRetryable: true,
    isAuthError: false,
  };
}

/**
 * Format success message with dispatch details
 */
export interface SuccessContext {
  dispatch_id: string;
  timestamp?: string;
  location_description?: string;
  urgency?: string;
}

export function getSuccessMessage(context: SuccessContext): string {
  const { dispatch_id, urgency } = context;
  const urgencyLabel = {
    low: "low priority",
    normal: "standard priority",
    critical: "critical priority",
  }[urgency || "normal"];

  return `Your report (ID: ${dispatch_id}) is live with ${urgencyLabel}. People nearby can see it now.`;
}
