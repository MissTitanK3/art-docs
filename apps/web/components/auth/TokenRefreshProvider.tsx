"use client";

import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import { useAuth } from "./AuthProvider";

/**
 * Token Refresh Provider
 * 
 * Automatically refreshes JWT token every 15 minutes if user is authenticated.
 * Should be placed inside AuthProvider in the component tree.
 * 
 * Example:
 * ```tsx
 * <AuthProvider>
 *   <TokenRefreshProvider>
 *     <App />
 *   </TokenRefreshProvider>
 * </AuthProvider>
 * ```
 */
export function TokenRefreshProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, logout } = useAuth();

  useTokenRefresh({
    enabled: isAuthenticated,
    intervalMinutes: 15,
    onRefreshSuccess: (data) => {
      if (data.refreshed) {
        console.log("Token refreshed successfully", {
          expires_at: data.expires_at,
        });
      }
    },
    onRefreshError: (error) => {
      console.error("Token refresh failed, logging out:", error);
      // Auto-logout on token refresh failure
      logout();
    },
  });

  return <>{children}</>;
}
