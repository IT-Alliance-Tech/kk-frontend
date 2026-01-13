"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminCardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export function AdminCard({ 
  children, 
  className,
  padding = "md",
  hover = false,
}: AdminCardProps) {
  const paddingStyles = {
    none: "",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-5 lg:p-6",
    lg: "p-5 sm:p-6 lg:p-8",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200/80 shadow-sm",
        paddingStyles[padding],
        hover && "hover:shadow-md hover:border-slate-300/80 transition-all duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}

interface AdminCardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function AdminCardHeader({ 
  title, 
  description, 
  action,
  className 
}: AdminCardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-4 lg:mb-6", className)}>
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-slate-900">{title}</h3>
        {description && (
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

interface AdminCardContentProps {
  children: ReactNode;
  className?: string;
}

export function AdminCardContent({ children, className }: AdminCardContentProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}

interface AdminCardFooterProps {
  children: ReactNode;
  className?: string;
}

export function AdminCardFooter({ children, className }: AdminCardFooterProps) {
  return (
    <div className={cn("mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-4", className)}>
      {children}
    </div>
  );
}
