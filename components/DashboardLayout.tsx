/**
 * Dashboard Layout Component
 * Provides a responsive layout with sidebar navigation for user account pages
 * Features:
 * - Left sidebar with navigation links (Dashboard, Profile, Orders, Addresses)
 * - Top navigation bar with title, cart button, and logout
 * - Mobile-responsive collapsible sidebar
 * - Clean white/red theme matching site design
 *
 * NOTE: This file includes an updated right-column that scrolls internally
 * so the left sidebar visually remains stationary. All edits are reversible
 * and marked with comment markers.
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
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
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
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Page Title */}
            <div className="flex-1 lg:flex-none">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Account</h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* BUY-NOW-BYPASS — 2025-12-05 (REVERT BEFORE PUSH) */}
              {/* Original "Buy Now" button commented out to allow QA: */}
              {/* <CartButton /> */}
              {/* Temporarily hiding "Buy Now" CTA as requested by product. Remove this bypass before any commit/push. */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 sm:px-6 lg:px-8 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/*
        IMPORTANT LAYOUT NOTE:
        - The wrapper below has a fixed height of calc(100vh - 64px) so the header
          (h-16) remains visible and the content area becomes an internal scroll region.
        - This ensures only the right column scrolls while the left sidebar stays visually static.
      */}
      <div className="flex" style={{ height: "calc(100vh - 64px)" }}>
        {/* Sidebar Navigation */}
        {/* Desktop Sidebar (kept in flow; not fixed) */}
        {/* SIDEBAR-ML-FIX — 2025-12-05 (REVERT BEFORE PUSH) */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
            <nav className="p-4 space-y-1">
              {/* User Info */}
              {user && (
                <div className="pb-4 mb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-red-50 text-red-600"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ORIGINAL-SIDEBAR-BLOCK — COMMENTED TEMPORARILY */}
        {/*
        <aside className="hidden lg:flex lg:flex-shrink-0 sticky top-16 self-start h-[calc(100vh-4rem)]">
          <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
            <nav className="p-4 space-y-1"> ... </nav>
          </div>
        </aside>
        */}

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full overflow-y-auto">
            <nav className="p-4 space-y-1 pt-20">
              {/* User Info */}
              {user && (
                <div className="pb-4 mb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-red-50 text-red-600"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area (right column) */}
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
