"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface AdminFormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function AdminFormField({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  children,
  className,
}: AdminFormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// Styled input component
interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function AdminInput({ error, className, ...props }: AdminInputProps) {
  return (
    <input
      className={cn(
        "w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-all",
        "placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
        error
          ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
          : "border-slate-200",
        className
      )}
      {...props}
    />
  );
}

// Styled textarea component
interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function AdminTextarea({ error, className, ...props }: AdminTextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-all resize-none",
        "placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
        error
          ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
          : "border-slate-200",
        className
      )}
      {...props}
    />
  );
}

// Styled select component
interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export function AdminSelect({ error, className, children, ...props }: AdminSelectProps) {
  return (
    <select
      className={cn(
        "w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-all",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
        error
          ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
          : "border-slate-200",
        !props.value && "text-slate-400",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

// Form section divider
interface AdminFormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function AdminFormSection({
  title,
  description,
  children,
  className,
}: AdminFormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="pb-2 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {description && (
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// Checkbox/Switch field
interface AdminCheckboxFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function AdminCheckboxField({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className,
}: AdminCheckboxFieldProps) {
  return (
    <label
      className={cn(
        "flex items-start gap-3 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="pt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={cn(
            "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
            checked
              ? "bg-emerald-600 border-emerald-600"
              : "bg-white border-slate-300"
          )}
        >
          {checked && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>
      <div className="flex-1">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}

// Switch/Toggle component
interface AdminSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function AdminSwitch({
  checked,
  onChange,
  disabled = false,
  className,
}: AdminSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-emerald-600" : "bg-slate-200",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
