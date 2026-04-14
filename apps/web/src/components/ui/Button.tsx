"use client";

import { type ButtonHTMLAttributes } from "react";
import { useTranslation } from "@/lib/i18n";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "success";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "btn-raised bg-[color:var(--accent)] text-white border-2 border-[color:var(--accent-strong)] hover:bg-[color:var(--accent-strong)] disabled:opacity-50 shadow-[0_4px_14px_rgba(109,40,217,0.35)]",
  secondary:
    "btn-raised border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] text-[color:var(--text-strong)] hover:bg-[color:var(--surface-muted)] disabled:opacity-50",
  danger:
    "btn-raised bg-[color:var(--danger)] text-white border-2 border-[#e02424] hover:opacity-90 disabled:opacity-50 shadow-[0_4px_14px_rgba(255,75,75,0.3)]",
  success:
    "btn-raised bg-[color:var(--success)] text-white border-2 border-[color:var(--success-strong)] hover:opacity-90 disabled:opacity-50 shadow-[0_4px_14px_rgba(88,204,2,0.3)]",
  ghost:
    "text-[color:var(--text-soft)] hover:text-[color:var(--text-strong)] hover:bg-[color:var(--surface-muted)] disabled:opacity-50",
};

const sizeStyles: Record<"sm" | "md" | "lg", string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export function Button({
  variant = "primary",
  isLoading,
  size = "md",
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const { t } = useTranslation();
  const loadingLabel = t.common.loading;
  return (
    <button
      className={`rounded-2xl font-semibold transition select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin-slow" />
          {loadingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
