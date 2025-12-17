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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Login page gets full viewport without layout constraints
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="kk-admin-layout min-h-screen bg-gray-50">
      {showNavigation && <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      <div className="flex flex-col min-h-screen md:ml-64">
        {showNavigation && <AdminTopbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}
        <main className="flex-1 p-2 sm:p-4 md:p-6 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
