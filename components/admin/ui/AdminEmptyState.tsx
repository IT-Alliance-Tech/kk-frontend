"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Package, FileX, Search, Inbox, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type EmptyStateType = "no-data" | "no-results" | "error" | "empty";

interface AdminEmptyStateProps {
  type?: EmptyStateType;
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

const defaultIcons: Record<EmptyStateType, ReactNode> = {
  "no-data": <Inbox className="w-12 h-12" />,
  "no-results": <Search className="w-12 h-12" />,
  "error": <AlertCircle className="w-12 h-12" />,
  "empty": <Package className="w-12 h-12" />,
};

const defaultIconColors: Record<EmptyStateType, string> = {
  "no-data": "text-slate-300",
  "no-results": "text-slate-300",
  "error": "text-red-300",
  "empty": "text-slate-300",
};

export function AdminEmptyState({
  type = "empty",
  title,
  description,
  icon,
  action,
  secondaryAction,
  className,
}: AdminEmptyStateProps) {
  const displayIcon = icon || defaultIcons[type];
  const iconColor = defaultIconColors[type];

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      <div className={cn("mb-4", iconColor)}>
        {displayIcon}
      </div>
      
      <h3 className="text-lg font-semibold text-slate-900 mb-1">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mb-6">
          {description}
        </p>
      )}
      
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            action.href ? (
              <Link href={action.href}>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  {action.label}
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={action.onClick}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {action.label}
              </Button>
            )
          )}
          
          {secondaryAction && (
            secondaryAction.href ? (
              <Link href={secondaryAction.href}>
                <Button variant="outline">
                  {secondaryAction.label}
                </Button>
              </Link>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
