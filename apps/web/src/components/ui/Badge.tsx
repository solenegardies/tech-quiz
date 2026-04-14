"use client";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "accent" | "xp";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[color:var(--surface-muted)] text-[color:var(--text-soft)] border border-[color:var(--border)]",
  success:
    "bg-[color:var(--success-soft)] text-[color:var(--success)] border border-[color:var(--success-border)]",
  warning:
    "bg-[color:var(--warning-soft)] text-[color:var(--warning)] border border-[color:var(--warning-border)]",
  danger:
    "bg-[color:var(--danger-soft)] text-[color:var(--danger)] border border-[color:var(--danger-border)]",
  accent:
    "bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)] border border-[color:var(--accent-border)]",
  xp: "bg-[color:var(--xp-gold-soft)] text-[color:var(--xp-gold)] border border-[rgba(245,158,11,0.25)]",
};

export function Badge({ children, variant = "default", icon }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${variantStyles[variant]}`}
    >
      {icon ? <span className="text-[0.7rem] leading-none">{icon}</span> : null}
      {children}
    </span>
  );
}
