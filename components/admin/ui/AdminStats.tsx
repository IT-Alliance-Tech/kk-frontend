"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  description?: string;
  className?: string;
  variant?: "default" | "success" | "warning" | "info";
}

const variantStyles = {
  default: {
    icon: "bg-slate-100 text-slate-600",
    trend: {
      positive: "text-emerald-600 bg-emerald-50",
      negative: "text-red-600 bg-red-50",
      neutral: "text-slate-600 bg-slate-50",
    },
  },
  success: {
    icon: "bg-emerald-100 text-emerald-600",
    trend: {
      positive: "text-emerald-600 bg-emerald-50",
      negative: "text-red-600 bg-red-50",
      neutral: "text-slate-600 bg-slate-50",
    },
  },
  warning: {
    icon: "bg-amber-100 text-amber-600",
    trend: {
      positive: "text-emerald-600 bg-emerald-50",
      negative: "text-red-600 bg-red-50",
      neutral: "text-slate-600 bg-slate-50",
    },
  },
  info: {
    icon: "bg-blue-100 text-blue-600",
    trend: {
      positive: "text-emerald-600 bg-emerald-50",
      negative: "text-red-600 bg-red-50",
      neutral: "text-slate-600 bg-slate-50",
    },
  },
};

export function AdminStatsCard({
  title,
  value,
  icon,
  trend,
  description,
  className,
  variant = "default",
}: AdminStatsCardProps) {
  const styles = variantStyles[variant];

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="w-3.5 h-3.5" />;
    if (trend.value < 0) return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  const getTrendStyle = () => {
    if (!trend) return "";
    if (trend.value > 0) return styles.trend.positive;
    if (trend.value < 0) return styles.trend.negative;
    return styles.trend.neutral;
  };

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 truncate">
            {value}
          </p>

          {(trend || description) && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                    getTrendStyle()
                  )}
                >
                  {getTrendIcon()}
                  {Math.abs(trend.value)}%
                </span>
              )}
              {(trend?.label || description) && (
                <span className="text-xs text-slate-500">
                  {trend?.label || description}
                </span>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div
            className={cn(
              "p-3 rounded-xl flex-shrink-0",
              styles.icon
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// Stats grid container
interface AdminStatsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function AdminStatsGrid({ 
  children, 
  columns = 4,
  className 
}: AdminStatsGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4 lg:gap-6", gridCols[columns], className)}>
      {children}
    </div>
  );
}
