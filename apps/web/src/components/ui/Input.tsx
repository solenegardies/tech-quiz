"use client";

import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`rounded-2xl border bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--text-strong)] focus:border-[color:var(--accent)] focus:outline-none ${
            error ? "border-[color:var(--danger)]" : "border-[color:var(--border)]"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-[color:var(--danger)]">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
