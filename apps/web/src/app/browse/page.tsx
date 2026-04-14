import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { BrowseQuestionCard } from "@/components/questions/BrowseQuestionCard";
import { getBrowseQuestions, getQuestionMeta } from "@/lib/questions/data";
import { getDictionary } from "@/lib/i18n";
import type { Difficulty } from "@/lib/questions/types";

function buildBrowseHref(
  params: {
    q?: string;
    category?: string;
    difficulty?: string;
    page?: number;
  },
) {
  const query = new URLSearchParams();

  if (params.q) {
    query.set("q", params.q);
  }

  if (params.category && params.category !== "all") {
    query.set("category", params.category);
  }

  if (params.difficulty && params.difficulty !== "all") {
    query.set("difficulty", params.difficulty);
  }

  if (params.page && params.page > 1) {
    query.set("page", String(params.page));
  }

  const built = query.toString();
  return built ? `/browse?${built}` : "/browse";
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    difficulty?: Difficulty | "all";
    page?: string;
  }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const page = Number.parseInt(params?.page ?? "1", 10);
  const meta = await getQuestionMeta();
  const t = getDictionary();
  const result = await getBrowseQuestions({
    query: params?.q,
    category: params?.category ?? "all",
    difficulty: params?.difficulty ?? "all",
    page: Number.isNaN(page) ? 1 : page,
    pageSize: 18,
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] p-7 shadow-[0_20px_60px_rgba(22,26,32,0.08)]">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--sky-soft)] border border-[rgba(28,176,246,0.2)] px-3 py-1.5 text-xs font-bold text-[color:var(--sky)]">
                {t.browse.freeExploration}
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-[color:var(--text-strong)] sm:text-4xl">
                {t.browse.browseBase}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[color:var(--text-soft)]">
                {t.browse.browseDescription}
              </p>
            </div>
            <Link
              href="/quiz"
              className="btn-raised inline-flex items-center rounded-xl border-2 border-[color:var(--accent-strong)] bg-[color:var(--accent)] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(109,40,217,0.35)] transition hover:bg-[color:var(--accent-strong)]"
            >
              {t.browse.quizMode}
            </Link>
          </div>

          <form method="GET" className="mt-7 grid gap-4 lg:grid-cols-[1.2fr_repeat(2,0.6fr)_auto]">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-[color:var(--text-soft)]">
                {t.browse.searchLabel}
              </span>
              <input
                type="search"
                name="q"
                defaultValue={params?.q ?? ""}
                placeholder={t.browse.searchPlaceholder}
                className="w-full rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-2.5 text-sm font-medium outline-none transition focus:border-[color:var(--accent)]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-[color:var(--text-soft)]">
                {t.browse.category}
              </span>
              <select
                name="category"
                defaultValue={params?.category ?? "all"}
                className="w-full rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-2.5 text-sm font-medium outline-none transition focus:border-[color:var(--accent)]"
              >
                <option value="all">{t.browse.allFeminine}</option>
                {meta.categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-[color:var(--text-soft)]">
                {t.browse.level}
              </span>
              <select
                name="difficulty"
                defaultValue={params?.difficulty ?? "all"}
                className="w-full rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-2.5 text-sm font-medium outline-none transition focus:border-[color:var(--accent)]"
              >
                <option value="all">{t.browse.allMasculine}</option>
                <option value="junior">{t.quiz.junior}</option>
                <option value="mid">{t.quiz.mid}</option>
                <option value="senior">{t.quiz.senior}</option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="btn-raised w-full rounded-xl border-2 border-[color:var(--accent-strong)] bg-[color:var(--accent)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[color:var(--accent-strong)]"
              >
                {t.browse.filter}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-medium text-[color:var(--text-soft)]">
              <span className="font-bold tabular-nums text-[color:var(--text-strong)]">{result.totalItems}</span>{" "}
              {result.totalItems > 1 ? t.common.questions : t.common.question}
            </p>
            <p className="text-sm font-medium tabular-nums text-[color:var(--text-soft)]">
              {t.common.page} {result.page} / {result.totalPages}
            </p>
          </div>

          {result.items.length ? (
            <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
              {result.items.map((question) => (
                <BrowseQuestionCard key={question.id} question={question} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-[color:var(--border)] bg-[color:var(--surface-strong)] px-6 py-12 text-center">
              <p className="text-3xl mb-3">?</p>
              <h2 className="font-display text-xl font-bold text-[color:var(--text-strong)]">
                {t.browse.noResults}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
                {t.browse.noResultsDescription}
              </p>
            </div>
          )}
        </section>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          {result.hasPreviousPage ? (
            <Link
              href={buildBrowseHref({
                q: params?.q,
                category: params?.category,
                difficulty: params?.difficulty,
                page: result.page - 1,
              })}
              className="btn-raised rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-2.5 text-sm font-bold text-[color:var(--text-strong)] transition hover:bg-[color:var(--surface-muted)]"
            >
              &larr; {t.browse.previous}
            </Link>
          ) : (
            <span />
          )}

          {result.hasNextPage ? (
            <Link
              href={buildBrowseHref({
                q: params?.q,
                category: params?.category,
                difficulty: params?.difficulty,
                page: result.page + 1,
              })}
              className="btn-raised rounded-xl border-2 border-[color:var(--accent-strong)] bg-[color:var(--accent)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[color:var(--accent-strong)]"
            >
              {t.browse.next} &rarr;
            </Link>
          ) : null}
        </div>
      </main>
    </div>
  );
}
