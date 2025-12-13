// NEW - admin demo
import React from "react";

interface KPIProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export default function KPI({ title, value, icon, trend, subtitle }: KPIProps) {
  return (
    <div className="kk-admin-kpi bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow w-full">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide truncate">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 truncate">{value}</p>

          {subtitle && <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>}

          {trend && (
            <div className="mt-2 sm:mt-3 flex items-center gap-1 flex-wrap">
              <span
                className={`text-xs sm:text-sm font-semibold ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 hidden sm:inline">vs last month</span>
            </div>
          )}
        </div>

        <div className="text-2xl sm:text-3xl md:text-4xl opacity-80 flex-shrink-0">{icon}</div>
      </div>
    </div>
  );
}
