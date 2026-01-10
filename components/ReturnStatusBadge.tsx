/**
 * Return Status Badge Component
 * Displays return/refund status with appropriate styling
 */

import React from "react";
import { ReturnStatus } from "@/lib/api/returns.api";

interface ReturnStatusBadgeProps {
  status: ReturnStatus | string;
  size?: "sm" | "md";
  showIcon?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  return_requested: { 
    label: "Return Requested", 
    color: "text-blue-700", 
    bgColor: "bg-blue-100",
    icon: "📝"
  },
  return_approved: { 
    label: "Return Approved", 
    color: "text-green-700", 
    bgColor: "bg-green-100",
    icon: "✅"
  },
  pickup_scheduled: { 
    label: "Pickup Scheduled", 
    color: "text-purple-700", 
    bgColor: "bg-purple-100",
    icon: "📦"
  },
  product_received: { 
    label: "Product Received", 
    color: "text-indigo-700", 
    bgColor: "bg-indigo-100",
    icon: "✔️"
  },
  refund_initiated: { 
    label: "Refund Initiated", 
    color: "text-yellow-700", 
    bgColor: "bg-yellow-100",
    icon: "💰"
  },
  refund_completed: { 
    label: "Refund Completed", 
    color: "text-green-700", 
    bgColor: "bg-green-100",
    icon: "✅"
  },
  return_completed: { 
    label: "Return Completed", 
    color: "text-slate-700", 
    bgColor: "bg-slate-200",
    icon: "✔️"
  },
  return_rejected: { 
    label: "Return Rejected", 
    color: "text-red-700", 
    bgColor: "bg-red-100",
    icon: "❌"
  },
  // Legacy
  pending: { 
    label: "Pending", 
    color: "text-blue-700", 
    bgColor: "bg-blue-100",
    icon: "⏳"
  },
  approved: { 
    label: "Approved", 
    color: "text-green-700", 
    bgColor: "bg-green-100",
    icon: "✅"
  },
  rejected: { 
    label: "Rejected", 
    color: "text-red-700", 
    bgColor: "bg-red-100",
    icon: "❌"
  },
  completed: { 
    label: "Completed", 
    color: "text-slate-700", 
    bgColor: "bg-slate-200",
    icon: "✔️"
  },
};

export default function ReturnStatusBadge({ 
  status, 
  size = "sm",
  showIcon = false 
}: ReturnStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { 
    label: status, 
    color: "text-gray-700", 
    bgColor: "bg-gray-100",
    icon: "•"
  };

  const sizeClasses = size === "md" 
    ? "px-3 py-1.5 text-sm" 
    : "px-2 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bgColor} ${config.color} ${sizeClasses}`}
    >
      {showIcon && <span>{config.icon}</span>}
      {config.label}
    </span>
  );
}

/**
 * Get status display configuration
 */
export function getReturnStatusDisplay(status: string) {
  return STATUS_CONFIG[status] || { 
    label: status, 
    color: "text-gray-700", 
    bgColor: "bg-gray-100",
    icon: "•"
  };
}
