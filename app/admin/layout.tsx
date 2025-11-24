// kk-frontend/app/admin/layout.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Allow the login page itself to render even if there's no token.
    const isLoginPage = pathname === "/admin/login" || pathname?.startsWith("/admin/login/");
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

    if (!token && !isLoginPage) {
      // Trying to access a protected admin route without token -> redirect to login
      router.push("/admin/login");
      return;
    }

    // If we're on the login page, or token exists, allow rendering
    setChecked(true);
  }, [router, pathname]);

  if (!checked) return null; // show nothing while verifying

  return (
    <div className="kk-admin-layout flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopbar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
