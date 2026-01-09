/**
 * Dashboard Layout Component - REDESIGNED
 * Modern, premium layout matching Kitchen Kettles brand
 * Features:
 * - Premium sidebar with gradient accents
 * - Modern navigation with smooth transitions
 * - Enhanced visual hierarchy and spacing
 * - Responsive mobile-first design
 * - Clean, professional aesthetic
 */

"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import CartButton from "./CartButton";
import {
  Home,
  User,
  ShoppingBag,
  MapPin,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Navigation items for sidebar
  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/account",
      icon: <Home className="w-5 h-5" />,
    },
    {
      label: "Profile",
      href: "/account/profile",
      icon: <User className="w-5 h-5" />,
    },
    {
      label: "Orders",
      href: "/account/orders",
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      label: "Addresses",
      href: "/account/addresses",
      icon: <MapPin className="w-5 h-5" />,
    },
  ];

  // Handle logout
  const handleLogout = async () => {
    // Logout will handle navigation and reload automatically
    await logout();
  };

  // Check if nav item is active
  const isActive = (href: string) => {
    if (href === "/account") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Premium Top Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Page Title with Brand Accent */}
            <div className="flex-1 lg:flex-none">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-emerald-600 bg-clip-text text-transparent">
                My Account
              </h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link 
                href="/"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-600 rounded-lg hover:bg-slate-50 transition-all duration-200"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex" style={{ height: "calc(100vh - 64px)" }}>
        {/* Desktop Sidebar - Modern Premium Design */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="w-72 bg-white border-r border-slate-200/60 h-full overflow-y-auto">
            <nav className="p-6 space-y-6">
              {/* User Info Card - Premium */}
              {user && (
                <div className="pb-6 mb-6 border-b border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links - Modern */}
              <div className="space-y-1">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? "bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`${active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {active && (
                        <ChevronRight className="w-4 h-4 text-emerald-600" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar - Premium Design */}
        <aside
          className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200/60 z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full overflow-y-auto">
            <nav className="p-6 space-y-6 pt-20">
              {/* User Info Card - Mobile */}
              {user && (
                <div className="pb-6 mb-6 border-b border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links - Mobile */}
              <div className="space-y-1">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? "bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`${active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {active && (
                        <ChevronRight className="w-4 h-4 text-emerald-600" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area - Premium Styling */}
        <main className="flex-1 min-w-0">
          <div
            className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
            style={{
              maxHeight: "calc(100vh - 64px)",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
