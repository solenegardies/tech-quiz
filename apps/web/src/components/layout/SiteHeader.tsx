"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { getStreak, getTotalXp, STREAK_EVENT, HISTORY_EVENT } from "@/lib/quiz/storage";
import { Logo } from "./Logo";

export function SiteHeader() {
  const { t } = useTranslation();
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);

  const navItems = [
    { href: "/quiz", label: t.nav.quiz, icon: ">" },
    { href: "/browse", label: t.nav.explore, icon: "~" },
    { href: "/dashboard", label: t.nav.profile, icon: "@" },
  ];

  useEffect(() => {
    const sync = () => {
      setStreak(getStreak().currentStreak);
      setXp(getTotalXp());
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(STREAK_EVENT, sync);
    window.addEventListener(HISTORY_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(STREAK_EVENT, sync);
      window.removeEventListener(HISTORY_EVENT, sync);
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--border)] bg-[color:var(--surface-strong)]/90 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size={40} className="rounded-xl shadow-[0_4px_14px_rgba(109,40,217,0.4)]" />
            <div className="hidden sm:block">
              <p className="font-display text-lg font-bold tracking-tight text-[color:var(--text-strong)]">
                TechQuiz
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-[color:var(--text-soft)] transition hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-strong)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Gamification stats */}
          <div className="flex items-center gap-2">
            {streak > 0 ? (
              <div className="flex items-center gap-1.5 rounded-full bg-[color:var(--xp-gold-soft)] px-3 py-1.5 border border-[rgba(245,158,11,0.2)]">
                <span className="text-sm leading-none">*</span>
                <span className="text-sm font-bold tabular-nums text-[color:var(--streak-orange)]">{streak}</span>
              </div>
            ) : null}
            {xp > 0 ? (
              <div className="flex items-center gap-1.5 rounded-full bg-[color:var(--accent-soft)] px-3 py-1.5 border border-[color:var(--accent-border)]">
                <span className="text-xs font-bold text-[color:var(--accent)]">XP</span>
                <span className="text-sm font-bold tabular-nums text-[color:var(--accent-strong)]">{xp}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="btn-raised shrink-0 rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[color:var(--text-strong)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
