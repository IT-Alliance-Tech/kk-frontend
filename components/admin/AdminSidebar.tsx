/**
 * Admin Sidebar - Redesigned
 * Modern, professional sidebar with Lucide icons
 * Features: collapsible, responsive, grouped navigation
 */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Tags,
  FolderTree,
  Home,
  ShoppingCart,
  RotateCcw,
  Ticket,
  Mail,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  ChefHat,
  Truck,
  Image as ImageIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navGroups: NavGroup[] = [
  {
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: <LayoutDashboard className="w-5 h-5" />
      },
    ],
  },
  {
    title: "Catalog",
    items: [
      {
        label: "Products",
        href: "/admin/products",
        icon: <Package className="w-5 h-5" />
      },
      {
        label: "Brands",
        href: "/admin/brands",
        icon: <Tags className="w-5 h-5" />
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: <FolderTree className="w-5 h-5" />
      },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        label: "Orders",
        href: "/admin/orders",
        icon: <ShoppingCart className="w-5 h-5" />
      },
      {
        label: "Returns",
        href: "/admin/returns",
        icon: <RotateCcw className="w-5 h-5" />
      },
      {
        label: "Delivery",
        href: "/admin/delivery",
        icon: <Truck className="w-5 h-5" />
      },
      {
        label: "Coupons",
        href: "/admin/coupons",
        icon: <Ticket className="w-5 h-5" />
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        label: "Homepage",
        href: "/admin/homepage",
        icon: <Home className="w-5 h-5" />
      },
      {
        label: "Media",
        href: "/admin/media",
        icon: <ImageIcon className="w-5 h-5" />
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        label: "Contact Forms",
        href: "/admin/contact-submissions",
        icon: <Mail className="w-5 h-5" />
      },
    ],
  },
];

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname?.startsWith(href);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 transition-all",
              collapsed && "justify-center"
            )}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white leading-tight">Kitchen</span>
                <span className="text-xs text-emerald-400 leading-tight">Kettles Admin</span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex} className={cn(groupIndex > 0 && "mt-6")}>
              {/* Group title */}
              {group.title && !collapsed && (
                <div className="px-3 mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {group.title}
                  </span>
                </div>
              )}

              {/* Group items */}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => onClose?.()}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                          active
                            ? "bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 text-emerald-400 shadow-sm"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/50",
                          collapsed && "justify-center px-0"
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <span className={cn(
                          "flex-shrink-0 transition-colors",
                          active ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
                        )}>
                          {item.icon}
                        </span>
                        {!collapsed && (
                          <span className="flex-1 truncate">{item.label}</span>
                        )}
                        {!collapsed && item.badge && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {active && !collapsed && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800/80 p-3 space-y-1">
          {/* Collapse toggle - desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "hidden md:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all",
              collapsed && "justify-center px-0"
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span>Collapse</span>
              </>
            )}
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>

          {/* Version info */}
          {!collapsed && (
            <div className="mt-3 px-3 pt-3 border-t border-slate-800/50">
              <p className="text-[10px] text-slate-600">Kitchen Kettles Admin v2.0</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
