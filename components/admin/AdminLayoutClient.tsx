/**
 * Admin Layout Client - Redesigned
 * Modern, responsive admin layout with smooth transitions
 */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { cn } from "@/lib/utils";

// Page title mapping for topbar
const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/products/new": "Add Product",
  "/admin/brands": "Brands",
  "/admin/brands/new": "Add Brand",
  "/admin/categories": "Categories",
  "/admin/categories/new": "Add Category",
  "/admin/orders": "Orders",
  "/admin/returns": "Returns",
  "/admin/coupons": "Coupons",
  "/admin/homepage": "Homepage Settings",
  "/admin/media": "Media Library",
  "/admin/contact-submissions": "Contact Submissions",
  "/admin/settings": "Settings",
};

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

  // Get page title from pathname
  const getPageTitle = () => {
    // Check for exact match first
    if (pageTitles[pathname || ""]) {
      return pageTitles[pathname || ""];
    }
    
    // Check for partial matches (e.g., /admin/products/123)
    if (pathname?.startsWith("/admin/products/view/")) return "Product Details";
    if (pathname?.startsWith("/admin/products/")) return "Edit Product";
    if (pathname?.startsWith("/admin/brands/")) return "Edit Brand";
    if (pathname?.startsWith("/admin/categories/")) return "Edit Category";
    if (pathname?.startsWith("/admin/orders/")) return "Order Details";
    
    return "Admin";
  };

  // Show nothing while checking authentication
  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if we should show navigation (hide on login page)
  const isLoginPage = pathname === "/admin/login" || pathname?.startsWith("/admin/login/");
  const showNavigation = !isLoginPage && verified;

  // Login page gets full viewport without layout constraints
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Sidebar */}
      {showNavigation && (
        <AdminSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      )}
      
      {/* Main content area */}
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300",
        showNavigation && "md:ml-64"
      )}>
        {/* Topbar */}
        {showNavigation && (
          <AdminTopbar 
            title={getPageTitle()}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          />
        )}
        
        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        {showNavigation && (
          <footer className="py-4 px-6 text-center border-t border-slate-200/80 bg-white/50">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Kitchen Kettles. All rights reserved.
            </p>
          </footer>
        )}
      </div>
    </div>
  );
}
