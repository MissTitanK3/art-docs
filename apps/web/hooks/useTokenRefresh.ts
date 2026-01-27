"use client";

import { useEffect, useCallback, useRef } from "react";

/**
 * Hook to automatically refresh JWT token before expiry
 *
 * Usage:
 * ```tsx
 * function MyApp() {
 *   const { refreshToken, lastRefresh } = useTokenRefresh({
 *     enabled: isAuthenticated,
 *     onRefreshSuccess: (data) => console.log('Token refreshed:', data),
 *     onRefreshError: (error) => handleLogout()
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 *
 * @param options.enabled - Whether to enable automatic refresh (default: true)
 * @param options.intervalMinutes - How often to check (default: 15 minutes)
 * @param options.onRefreshSuccess - Callback when refresh succeeds
 * @param options.onRefreshError - Callback when refresh fails (e.g., logout user)
 */
export function useTokenRefresh(
  options: {
    enabled?: boolean;
    intervalMinutes?: number;
    onRefreshSuccess?: (data: {
      user: {
        id: string;
        email: string;
        role: string;
        allowed_regions: string[];
      };
      token?: string;
      expires_at: string | null;
      refreshed: boolean;
    }) => void;
    onRefreshError?: (error: Error) => void;
  } = {}
) {
  const {
    enabled = true,
    intervalMinutes = 15,
    onRefreshSuccess,
    onRefreshError,
  } = options;

  const lastRefreshRef = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include", // Include HttpOnly cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Session refresh failed: ${response.status}`);
      }

      const data = await response.json();
      lastRefreshRef.current = new Date();

      if (onRefreshSuccess) {
        onRefreshSuccess(data);
      }

      return data;
    } catch (error) {
      console.error("Token refresh error:", error);
      const err =
        error instanceof Error ? error : new Error("Token refresh failed");

      if (onRefreshError) {
        onRefreshError(err);
      }

      throw err;
    }
  }, [onRefreshSuccess, onRefreshError]);

  useEffect(() => {
    if (!enabled) {
      // Clear interval if disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Check token immediately on mount
    refreshToken().catch(() => {
      // Error already handled in refreshToken
    });

    // Set up interval to check every N minutes
    const intervalMs = intervalMinutes * 60 * 1000;
    intervalRef.current = setInterval(() => {
      refreshToken().catch(() => {
        // Error already handled in refreshToken
      });
    }, intervalMs);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, intervalMinutes, refreshToken]);

  return {
    refreshToken,
    lastRefresh: lastRefreshRef.current,
  };
}
