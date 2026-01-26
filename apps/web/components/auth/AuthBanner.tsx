"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { ThemeToggle, AccessibilitySettingsSheet, Button } from '@repo/ui';
import { Home, LogIn, UserPlus } from 'lucide-react';

export default function AuthBanner() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="w-full border-b bg-card text-card-foreground border-border">
      <div className="px-4 py-2 space-y-2">
        {/* First line: Navigation & Controls */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            aria-label="Go to home"
          >
            <Home className="h-4 w-4" />
          </Button>

          {!isAuthenticated && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/login")}
              >
                <LogIn className="h-3.5 w-3.5 mr-1" />
              </Button>
              <Button
                size="sm"
                onClick={() => router.push("/register")}
              >
                <UserPlus className="h-3.5 w-3.5 mr-1" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <AccessibilitySettingsSheet />
            <ThemeToggle />
          </div>
        </div>

        {/* Second line: Auth Status (only when authenticated) */}
        {isAuthenticated && (
          <div className="text-sm w-full text-center">
            Signed in as <strong className="font-semibold">{user?.email ?? 'Authenticated user'}</strong>
            {user?.role && <span className="text-muted-foreground"> · {user.role}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
