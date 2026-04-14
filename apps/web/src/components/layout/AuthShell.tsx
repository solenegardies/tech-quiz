import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { Logo } from "./Logo";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  const t = getDictionary();

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:grid lg:grid-cols-[0.95fr_0.85fr] lg:items-center">
        <section className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-[0_28px_90px_rgba(22,26,32,0.08)] sm:p-8 lg:p-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <Logo size={44} className="rounded-2xl" />
            <div>
              <p className="font-display text-lg font-semibold text-[color:var(--text-strong)]">TechQuiz</p>
              <p className="text-xs text-[color:var(--text-soft)]">{t.authShell.subtitle}</p>
            </div>
          </Link>

          <div className="mt-10">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[color:var(--text-soft)]">
              {eyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-[color:var(--text-strong)] sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[color:var(--text-soft)]">
              {description}
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] bg-[color:var(--surface-muted)] p-4">
              <p className="text-sm text-[color:var(--text-soft)]">{t.authShell.pace}</p>
              <p className="mt-2 font-display text-2xl font-semibold text-[color:var(--text-strong)]">
                {t.authShell.shortSessions}
              </p>
            </div>
            <div className="rounded-[24px] bg-[color:var(--surface-muted)] p-4">
              <p className="text-sm text-[color:var(--text-soft)]">{t.authShell.content}</p>
              <p className="mt-2 font-display text-2xl font-semibold text-[color:var(--text-strong)]">
                {t.authShell.questionCount}
              </p>
            </div>
            <div className="rounded-[24px] bg-[color:var(--surface-muted)] p-4">
              <p className="text-sm text-[color:var(--text-soft)]">{t.authShell.usage}</p>
              <p className="mt-2 font-display text-2xl font-semibold text-[color:var(--text-strong)]">
                {t.authShell.mobileIncluded}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-[0_28px_90px_rgba(22,26,32,0.08)] sm:p-8">
          {children}
        </section>
      </div>
    </div>
  );
}
