/**
 * Protected Route Component
 * Wrapper that requires authentication to access child components
 *
 * Usage:
 * ```tsx
 * <ProtectedRoute>
 *   <YourProtectedComponent />
 * </ProtectedRoute>
 * ```
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import GlobalLoader from "@/components/common/GlobalLoader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  redirectTo = "/(auth)/login",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if not loading and no user
    if (!loading && !user) {
      // Get current path to redirect back after login
      const currentPath = window.location.pathname;
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <GlobalLoader size="large" />
          <p className="text-slate-600 mt-4">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!user) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
