"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, MoreHorizontal } from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  render?: (item: T, index: number) => ReactNode;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string) => void;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  rowClassName?: (item: T) => string;
  stickyHeader?: boolean;
}

export function AdminTable<T>({
  columns,
  data,
  keyExtractor,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  isLoading,
  emptyMessage = "No data found",
  rowClassName,
  stickyHeader = false,
}: AdminTableProps<T>) {
  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;
    
    if (sortColumn === column.key) {
      return sortDirection === "asc" ? (
        <ChevronUp className="w-4 h-4 text-emerald-600" />
      ) : (
        <ChevronDown className="w-4 h-4 text-emerald-600" />
      );
    }
    
    return (
      <div className="w-4 h-4 text-slate-300 group-hover:text-slate-400">
        <ChevronUp className="w-4 h-4 -mb-1" />
      </div>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200/80">
      <table className="w-full min-w-[640px]">
        <thead className={cn(
          "bg-slate-50/80 border-b border-slate-200/80",
          stickyHeader && "sticky top-0 z-10"
        )}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider",
                  column.sortable && "cursor-pointer select-none group hover:text-slate-900",
                  column.headerClassName
                )}
                onClick={() => column.sortable && onSort?.(column.key)}
              >
                <div className="flex items-center gap-1.5">
                  {column.header}
                  {renderSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={keyExtractor(item)}
                className={cn(
                  "hover:bg-slate-50/50 transition-colors",
                  onRowClick && "cursor-pointer",
                  rowClassName?.(item)
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-4 py-3.5 text-sm text-slate-700",
                      column.className
                    )}
                  >
                    {column.render
                      ? column.render(item, index)
                      : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Action menu for table rows
interface TableActionMenuProps {
  children: ReactNode;
}

export function TableActionMenu({ children }: TableActionMenuProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      {children}
    </div>
  );
}

interface TableActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  icon: ReactNode;
  label: string;
  variant?: "default" | "danger";
}

export function TableActionButton({ 
  onClick, 
  icon, 
  label,
  variant = "default" 
}: TableActionButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={cn(
        "p-2 rounded-lg transition-colors",
        variant === "default" && "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50",
        variant === "danger" && "text-slate-500 hover:text-red-600 hover:bg-red-50"
      )}
      title={label}
    >
      {icon}
    </button>
  );
}
