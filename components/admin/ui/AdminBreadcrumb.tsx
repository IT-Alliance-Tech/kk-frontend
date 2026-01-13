"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function AdminBreadcrumb({ items, className }: AdminBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm", className)}
    >
      <ol className="flex items-center gap-1.5 flex-wrap">
        {/* Home link */}
        <li>
          <Link
            href="/admin"
            className="flex items-center text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            {item.href && index < items.length - 1 ? (
              <Link
                href={item.href}
                className="text-slate-500 hover:text-emerald-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-700 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
