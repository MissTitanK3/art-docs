"use client";

import { ReactNode } from "react";
import { ThemeProvider, AccessibilityThemeProvider } from "@repo/ui";
import { AuthProvider } from "./auth/AuthProvider";
import AuthBanner from "./auth/AuthBanner";

interface ProvidersProps {
  children: ReactNode;
  host: string;
  subdomain: string;
}

export function Providers({ children, host, subdomain }: ProvidersProps) {
  return (
    <AccessibilityThemeProvider>
      <ThemeProvider>
        <div data-host={host} data-env={process.env.NODE_ENV} data-subdomain={subdomain}>
          <AuthProvider>
            <AuthBanner />
            {children}
          </AuthProvider>
        </div>
      </ThemeProvider>
    </AccessibilityThemeProvider>
  );
}
