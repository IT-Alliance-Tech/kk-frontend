// kk-frontend/components/admin/AdminLayoutClient.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

/**
 * Client-side admin layout with cookie-based verification
 * This component verifies admin session using backend /auth/verify endpoint
 * before rendering protected admin pages
 */
export default function AdminLayoutClient({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  // TEMPORARY AUTH BYPASS — 2025-12-05 (DO NOT DEPLOY)
  // WARNING: Do not deploy with middleware bypassed. Revert before pushing.
  // Original session verification logic commented out to allow QA access while login/OTP is being fixed:
  // useEffect(() => {
  //   async function verifySession() {
  //     const isLoginPage = pathname === "/admin/login" || pathname?.startsWith("/admin/login/");
  //     
  //     // Allow login page to render without verification
  //     if (isLoginPage) {
  //       setVerified(true);
  //       setChecking(false);
  //       return;
  //     }

  //     try {
  //       // Call backend /auth/verify with cookies
  //       const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://kk-backend-5c11.onrender.com/api';
  //       
  //       const response = await fetch(`${BACKEND_BASE}/auth/verify`, {
  //         method: 'GET',
  //         credentials: 'include', // Send cookies
  //         cache: 'no-store'
  //       });

  //       if (response.ok) {
  //         const data = await response.json();
  //         if (data.ok && data.user) {
  //           // Valid admin session
  //           setVerified(true);
  //           setChecking(false);
  //           return;
  //         }
  //       }
  //       
  //       // Invalid session - redirect to login
  //       router.push('/admin/login');
  //     } catch (error) {
  //       console.error('Admin verification error:', error);
  //       // On error, redirect to login
  //       router.push('/admin/login');
  //     }
  //   }

  //   verifySession();
  // }, [pathname, router]);

  // Bypassing admin session verification for QA — allow rendering all admin pages for now.
  useEffect(() => {
    setVerified(true);
    setChecking(false);
  }, []);

  // Show nothing while checking authentication
  if (checking) {
    return null;
  }

  // Check if we should show navigation (hide on login page)
  const isLoginPage = pathname === "/admin/login" || pathname?.startsWith("/admin/login/");
  const showNavigation = !isLoginPage && verified;

  return (
    <div className="kk-admin-layout min-h-screen bg-gray-50">
      {showNavigation && <AdminSidebar />}
      <div className={`flex flex-col min-h-screen ${showNavigation ? "ml-64" : ""}`}>
        {showNavigation && <AdminTopbar />}
        <main className={showNavigation ? "flex-1 p-6 overflow-auto" : "flex-1"}>
          {children}
        </main>
      </div>
    </div>
  );
}
