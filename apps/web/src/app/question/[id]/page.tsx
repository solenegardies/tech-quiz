import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { QuestionCodeBlock } from "@/components/questions/QuestionCodeBlock";
import { QuestionMetaStrip } from "@/components/questions/QuestionMetaStrip";
import { QuestionOptions } from "@/components/questions/QuestionOptions";
import { QuestionRichText, renderInlineMarkdown } from "@/components/questions/QuestionRichText";
import { ReviewToggleButton } from "@/components/questions/ReviewToggleButton";
import { getQuestionById } from "@/lib/questions/data";
import { getDictionary } from "@/lib/i18n";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const question = await getQuestionById(id);
  const t = getDictionary();

  if (!question) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/browse"
            className="btn-raised inline-flex items-center gap-1 rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2 text-sm font-bold text-[color:var(--text-strong)] transition hover:bg-[color:var(--surface-muted)]"
          >
            &larr; {t.common.back}
          </Link>
          <ReviewToggleButton questionId={question.id} />
        </div>

        {/* ── 2-column layout: enonce | reponses ─────────────── */}
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Left column — enonce */}
          <section className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-[0_20px_60px_rgba(22,26,32,0.08)] md:p-8">
            <QuestionMetaStrip question={question} />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--text-soft)]">
              {question.term}
            </p>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-[color:var(--text-strong)] sm:text-3xl">
              {renderInlineMarkdown(question.prompt)}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[color:var(--text-soft)]">{question.sourceSection}</p>

            {question.codeSnippets.length > 0 ? (
              <div className="mt-6 space-y-4">
                {question.codeSnippets.map((snippet) => (
                  <QuestionCodeBlock
                    key={snippet.label}
                    snippet={{ language: snippet.language, code: snippet.code }}
                    label={snippet.label}
                  />
                ))}
              </div>
            ) : question.codeSnippet ? (
              <div className="mt-6">
                <QuestionCodeBlock snippet={question.codeSnippet} />
              </div>
            ) : null}
          </section>

          {/* Right column — reponses possibles */}
          <section className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-[0_20px_60px_rgba(22,26,32,0.08)] md:p-8">
            <QuestionOptions question={question} />
          </section>
        </div>

        {/* ── Details section below ──────────────────────────── */}
        <div className="mt-5 grid gap-5">
          <section className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-muted)] p-6">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-[color:var(--text-strong)]">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[color:var(--accent)] text-xs font-bold text-white">R</span>
              {t.questionDetail.detailedAnswer}
            </h2>
            <div className="mt-4">
              <QuestionRichText content={question.referenceAnswerMd} />
            </div>
          </section>

          {question.interviewReflex ? (
            <section className="rounded-2xl border-2 border-[color:var(--accent-border)] bg-[color:var(--accent-soft,var(--surface-muted))] p-6">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-[color:var(--text-strong)]">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[color:var(--accent)] text-xs font-bold text-white">!</span>
                {t.questionDetail.interviewReflex}
              </h2>
              <p className="mt-4 text-sm leading-6 text-[color:var(--text-strong)]">
                {question.interviewReflex}
              </p>
            </section>
          ) : null}

          {(question.expectedAnswerPoints.length > 0 || question.commonMistakes.length > 0) && (
          <div className="grid gap-5 lg:grid-cols-2">
            {question.expectedAnswerPoints.length > 0 && (
            <section className="rounded-xl border-2 border-[color:var(--success-border)] bg-[color:var(--success-soft)] p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[color:var(--text-strong)]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--success)] text-xs font-bold text-white">V</span>
                {t.questionDetail.expectedPoints}
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--text-strong)]">
                {question.expectedAnswerPoints.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--success)]" />
                    <span>{renderInlineMarkdown(point)}</span>
                  </li>
                ))}
              </ul>
            </section>
            )}

            {question.commonMistakes.length > 0 && (
            <section className="rounded-xl border-2 border-[color:var(--warning-border)] bg-[color:var(--warning-soft)] p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[color:var(--text-strong)]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--warning)] text-xs font-bold text-white">!</span>
                {t.questionDetail.commonMistakes}
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--text-strong)]">
                {question.commonMistakes.map((mistake) => (
                  <li key={mistake} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--warning)]" />
                    <span>{renderInlineMarkdown(mistake)}</span>
                  </li>
                ))}
              </ul>
            </section>
            )}
          </div>
          )}

          {(question.relatedTerms.length > 0 || question.resources.length > 0) && (
          <div className="grid gap-5 lg:grid-cols-2">
            {question.relatedTerms.length > 0 && (
            <section className="rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface-muted)] p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[color:var(--text-strong)]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--sky)] text-xs font-bold text-white">~</span>
                {t.questionDetail.relatedTerms}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {question.relatedTerms.map((term) => (
                  <span
                    key={term}
                    className="rounded-full border-2 border-[color:var(--border)] bg-white/70 px-3 py-1.5 text-sm font-medium text-[color:var(--text-strong)]"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </section>
            )}

            {question.resources.length > 0 && (
            <section className="rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface-muted)] p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[color:var(--text-strong)]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--accent)] text-xs font-bold text-white">+</span>
                {t.questionDetail.resources}
              </h2>
              <ul className="mt-4 space-y-3">
                {question.resources.map((resource) => (
                  <li key={resource.id}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl border-2 border-[color:var(--border)] bg-white/70 px-4 py-3 transition hover:border-[color:var(--accent)] hover:-translate-y-0.5"
                    >
                      <p className="font-semibold text-[color:var(--text-strong)]">{resource.title}</p>
                      <p className="mt-1 text-xs text-[color:var(--text-soft)]">
                        {resource.authority} · {resource.domain}
                      </p>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
            )}
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
