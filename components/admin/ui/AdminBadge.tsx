"use client";

import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = 
  | "default" 
  | "success" 
  | "warning" 
  | "danger" 
  | "info" 
  | "secondary"
  | "emerald"
  | "purple"
  | "blue"
  | "orange"
  | "pink";

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700 border-slate-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  secondary: "bg-slate-50 text-slate-600 border-slate-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  pink: "bg-pink-50 text-pink-700 border-pink-200",
};

const dotStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
  secondary: "bg-slate-400",
  emerald: "bg-emerald-500",
  purple: "bg-purple-500",
  blue: "bg-blue-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export function AdminBadge({ 
  children, 
  variant = "default", 
  size = "md",
  dot = false,
  className 
}: AdminBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", dotStyles[variant])} />
      )}
      {children}
    </span>
  );
}

// Status badge specifically for order/return statuses
interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusVariantMap: Record<string, BadgeVariant> = {
  // Order statuses
  pending: "warning",
  processing: "info",
  shipped: "purple",
  delivered: "success",
  cancelled: "danger",
  // Return statuses
  requested: "warning",
  approved: "info",
  rejected: "danger",
  completed: "success",
  refunded: "success",
  // Generic
  active: "success",
  inactive: "secondary",
  disabled: "secondary",
  enabled: "success",
  draft: "secondary",
  published: "success",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase() || "default";
  const variant = statusVariantMap[normalizedStatus] || "default";

  return (
    <AdminBadge variant={variant} dot className={cn("capitalize", className)}>
      {status}
    </AdminBadge>
  );
}
