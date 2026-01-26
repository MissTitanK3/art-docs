"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import type { UserRole } from '@/types';

export default function RequireAuth({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: UserRole[];
}) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (roles && user && !roles.includes(user.role)) {
      router.replace('/');
    }
  }, [isAuthenticated, roles, user, router]);

  if (!isAuthenticated) return null;
  if (roles && user && !roles.includes(user.role)) return null;

  return children;
}
