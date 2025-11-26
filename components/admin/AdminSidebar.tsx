// NEW - admin demo
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Products", href: "/admin/products", icon: "📦" },
  { label: "Brands", href: "/admin/brands", icon: "🏷️" },
  { label: "Categories", href: "/admin/categories", icon: "📂" },
  { label: "Orders", href: "/admin/orders", icon: "🛒" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`kk-admin-sidebar bg-gray-900 text-white transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } min-h-screen flex flex-col`}
    >
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!collapsed && <h2 className="text-xl font-bold">Admin Panel</h2>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-800 rounded"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!collapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        {!collapsed && (
          <div className="text-xs text-gray-400">
            <p>Kitchen Kettles Admin</p>
            <p>v1.0.0</p>
          </div>
        )}
      </div>
    </aside>
  );
}
