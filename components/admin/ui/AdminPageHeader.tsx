"use client";

import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  backLink?: string;
  backLabel?: string;
  actions?: ReactNode;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: ReactNode;
  };
  badge?: ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  backLink,
  backLabel = "Back",
  actions,
  primaryAction,
  badge,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6 lg:mb-8">
      {/* Back Link */}
      {backLink && (
        <Link
          href={backLink}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600 mb-4 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {backLabel}
        </Link>
      )}

      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="mt-1.5 text-sm sm:text-base text-slate-500 max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {actions}
          {primaryAction && (
            primaryAction.href ? (
              <Link href={primaryAction.href}>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  {primaryAction.icon || <Plus className="w-4 h-4 mr-2" />}
                  {primaryAction.label}
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={primaryAction.onClick}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                {primaryAction.icon || <Plus className="w-4 h-4 mr-2" />}
                {primaryAction.label}
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
