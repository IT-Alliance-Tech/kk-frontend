"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AdminLoadingStateProps {
  fullPage?: boolean;
  message?: string;
  className?: string;
}

export function AdminLoadingState({
  fullPage = false,
  message = "Loading...",
  className,
}: AdminLoadingStateProps) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative">
        {/* Outer ring */}
        <div className="w-12 h-12 rounded-full border-4 border-slate-100" />
        {/* Spinning ring */}
        <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-t-emerald-600 animate-spin" />
      </div>
      {message && (
        <p className="mt-4 text-sm text-slate-500 animate-pulse">{message}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

// Skeleton loader components
interface AdminSkeletonProps {
  className?: string;
}

export function AdminSkeleton({ className }: AdminSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-slate-100",
        className
      )}
    />
  );
}

// Skeleton for table rows
export function AdminTableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200/80">
      {/* Header */}
      <div className="bg-slate-50/80 px-4 py-3.5 border-b border-slate-200/80">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <AdminSkeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-slate-100 bg-white">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-4 py-4">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <AdminSkeleton
                  key={colIndex}
                  className={cn(
                    "h-4 flex-1",
                    colIndex === 0 && "max-w-[200px]"
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton for stats cards
export function AdminStatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6"
        >
          <AdminSkeleton className="h-4 w-24 mb-3" />
          <AdminSkeleton className="h-8 w-32 mb-3" />
          <AdminSkeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

// Skeleton for cards
export function AdminCardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6">
      <AdminSkeleton className="h-5 w-40 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <AdminSkeleton
            key={i}
            className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full")}
          />
        ))}
      </div>
    </div>
  );
}
