"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminFilterBarProps {
  children?: ReactNode;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  showFiltersButton?: boolean;
  filtersOpen?: boolean;
  onToggleFilters?: () => void;
  activeFiltersCount?: number;
  onClearFilters?: () => void;
  className?: string;
}

export function AdminFilterBar({
  children,
  searchValue = "",
  searchPlaceholder = "Search...",
  onSearchChange,
  showFiltersButton = false,
  filtersOpen = false,
  onToggleFilters,
  activeFiltersCount = 0,
  onClearFilters,
  className,
}: AdminFilterBarProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Main filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        {onSearchChange && (
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Additional inline filters */}
        {children}

        {/* Filter toggle button */}
        {showFiltersButton && (
          <Button
            variant="outline"
            onClick={onToggleFilters}
            className={cn(
              "flex-shrink-0",
              filtersOpen && "bg-slate-50 border-slate-300"
            )}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        )}

        {/* Clear filters button */}
        {activeFiltersCount > 0 && onClearFilters && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="flex-shrink-0 text-slate-500 hover:text-slate-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

// Filter panel for advanced filters
interface AdminFilterPanelProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
}

export function AdminFilterPanel({ isOpen, children, className }: AdminFilterPanelProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "p-4 bg-slate-50/50 rounded-lg border border-slate-200/80",
        className
      )}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
}

// Individual filter field
interface AdminFilterFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function AdminFilterField({ label, children, className }: AdminFilterFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

// Filter select component
interface AdminFilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: { value: string; label: string }[];
  className?: string;
}

export function AdminFilterSelect({
  value,
  onChange,
  placeholder = "Select...",
  options,
  className,
}: AdminFilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all",
        !value && "text-slate-400",
        className
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// Filter input component
interface AdminFilterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
  className?: string;
}

export function AdminFilterInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className,
}: AdminFilterInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all",
        className
      )}
    />
  );
}
