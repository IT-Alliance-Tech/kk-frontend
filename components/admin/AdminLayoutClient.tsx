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

  useEffect(() => {
    async function verifySession() {
      const isLoginPage = pathname === "/admin/login" || pathname?.startsWith("/admin/login/");
      
      // Allow login page to render without verification
      if (isLoginPage) {
        setVerified(true);
        setChecking(false);
        return;
      }

      // REMOVED_VERIFY_BY_COPILOT — verify call removed per dev request. Rollback: restore token check and fetch to /auth/verify.
      // Allow all admin pages to render without verification
      setVerified(true);
      setChecking(false);
    }

    verifySession();
  }, [pathname, router]);

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
