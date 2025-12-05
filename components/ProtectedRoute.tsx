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
import { Loader2 } from "lucide-react";

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

  // TEMPORARY AUTH BYPASS — 2025-12-05 (REVERT BEFORE PUSH)
  // Original auth logic commented out to allow QA access while login/OTP is being fixed:
  // useEffect(() => {
  //   // Only redirect if not loading and no user
  //   if (!loading && !user) {
  //     // Get current path to redirect back after login
  //     const currentPath = window.location.pathname;
  //     const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
  //     router.push(redirectUrl);
  //   }
  // }, [user, loading, router, redirectTo]);

  // // Show loading spinner while checking auth
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
  //         <p className="text-slate-600">Checking authentication...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // // Don't render children if not authenticated
  // if (!user) {
  //   return null;
  // }

  // Bypassing auth guard for QA — allow rendering for now.
  // User is authenticated, render children
  return <>{children}</>;
}
