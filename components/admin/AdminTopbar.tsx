// NEW - admin demo
"use client";

import React from "react";
import { Menu } from "lucide-react";

interface AdminTopbarProps {
  title?: string;
  onMenuClick?: () => void;
}

export default function AdminTopbar({ title = "Dashboard", onMenuClick }: AdminTopbarProps) {
  return (
    <header className="kk-admin-topbar bg-white border-b border-gray-200 px-2 sm:px-4 md:px-6 py-3 md:py-4 flex items-center justify-between overflow-x-hidden sticky top-0 z-20">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Mobile hamburger menu - only visible on mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
          aria-label="Toggle sidebar menu"
        >
          <Menu className="w-5 h-5 text-gray-900" />
        </button>
        
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">{title}</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
        {/* removed bell icon per request — preserves header layout */}

        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200">
          <div className="text-right hidden md:block">
            <p className="text-xs sm:text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500 truncate max-w-[120px]">admin@kitchenkettles.com</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
