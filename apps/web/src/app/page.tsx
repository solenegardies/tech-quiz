import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { HomeClientPanels } from "@/components/home/HomeClientPanels";
import { getQuestionMeta } from "@/lib/questions/data";
import { getDictionary } from "@/lib/i18n";

function toMarketingNumber(value: number): string {
  if (value < 10) return `${value}`;
  if (value < 100) return `+${Math.floor(value / 10) * 10}`;
  if (value < 1000) return `+${Math.floor(value / 100) * 100}`;
  return `+${Math.floor(value / 100) * 100}`;
}

export default async function HomePage() {
  const meta = await getQuestionMeta();
  const t = getDictionary();

  const difficultyShare = [
    {
      label: t.quiz.junior,
      value: meta.difficultyDistribution.junior,
      color: "bg-[color:var(--accent)]",
      textColor: "text-[color:var(--accent)]",
    },
    {
      label: t.quiz.mid,
      value: meta.difficultyDistribution.mid,
      color: "bg-[color:var(--warning)]",
      textColor: "text-[color:var(--warning)]",
    },
    {
      label: t.quiz.senior,
      value: meta.difficultyDistribution.senior,
      color: "bg-[color:var(--danger)]",
      textColor: "text-[color:var(--danger)]",
    },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] p-8 shadow-[0_20px_60px_rgba(22,26,32,0.08)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent-soft)] border border-[color:var(--accent-border)] px-3 py-1.5 text-xs font-bold text-[color:var(--accent-strong)]">
                {t.home.heroTag}
              </div>
              <h1 className="mt-5 max-w-2xl font-display text-4xl font-bold tracking-tight text-[color:var(--text-strong)] sm:text-5xl lg:text-6xl">
                {t.home.heroTitle}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-[color:var(--text-soft)]">
                {t.home.heroDescription}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/quiz"
                  className="btn-raised inline-flex items-center rounded-xl border-2 border-[color:var(--accent-strong)] bg-[color:var(--accent)] px-7 py-3.5 text-base font-bold text-white shadow-[0_4px_14px_rgba(109,40,217,0.35)] transition hover:bg-[color:var(--accent-strong)] active:translate-y-0.5 active:border-b-0"
                >
                  {t.home.startQuiz}
                </Link>
                <Link
                  href="/browse"
                  className="btn-raised inline-flex items-center rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] px-7 py-3.5 text-base font-bold text-[color:var(--text-strong)] transition hover:bg-[color:var(--surface-muted)]"
                >
                  {t.home.browseQuestions}
                </Link>
              </div>
            </div>

            {/* Stats column */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-muted)] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--text-soft)]">
                  {t.home.questionBank}
                </p>
                <p className="mt-3 font-display text-4xl font-bold text-[color:var(--accent)]">
                  {toMarketingNumber(meta.totalQuestions)}
                </p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
                  {t.home.questionBankDescription}
                </p>
              </div>
              <div className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-muted)] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--text-soft)]">
                  {t.home.categoriesCovered}
                </p>
                <p className="mt-3 font-display text-4xl font-bold text-[color:var(--warning)]">
                  {meta.categoryCount}
                </p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
                  {t.home.categoriesCoveredDescription}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Difficulty + Categories */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-[0_20px_60px_rgba(22,26,32,0.08)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--text-soft)]">
              {t.home.difficultyDistribution}
            </p>
            <div className="mt-5 space-y-4">
              {difficultyShare.map((item) => {
                const ratio = Math.round((item.value / meta.totalQuestions) * 100);

                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className={`font-bold ${item.textColor}`}>{item.label}</span>
                      <span className="font-medium tabular-nums text-[color:var(--text-soft)]">
                        {ratio}%
                      </span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-[color:var(--surface-muted)]">
                      <div
                        className={`h-full rounded-full ${item.color} progress-bar-fill`}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-[0_20px_60px_rgba(22,26,32,0.08)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--text-soft)]">
              {t.home.topThemes}
            </p>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {meta.categories.slice(0, 8).map((category) => (
                <div
                  key={category.value}
                  className="flex items-center justify-between rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4 transition hover:border-[color:var(--accent)]"
                >
                  <p className="text-sm font-bold text-[color:var(--text-strong)]">{category.label}</p>
                  <span className="rounded-full bg-[color:var(--accent-soft)] px-2.5 py-0.5 text-xs font-bold tabular-nums text-[color:var(--accent-strong)]">
                    {toMarketingNumber(category.count)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Client panels */}
        <div className="mt-6">
          <HomeClientPanels />
        </div>
      </main>
    </div>
  );
}
