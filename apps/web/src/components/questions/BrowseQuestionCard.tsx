"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { QuestionMetaStrip } from "@/components/questions/QuestionMetaStrip";
import { QuestionRichText } from "@/components/questions/QuestionRichText";
import { ReviewToggleButton } from "@/components/questions/ReviewToggleButton";
import type { QuizQuestion } from "@/lib/questions/types";

function CorrectAnswerBadge({ question, t }: { question: QuizQuestion; t: ReturnType<typeof useTranslation>["t"] }) {
  if (question.questionFormat === "mcq") {
    const correct = question.options.filter((o) => o.isCorrect);
    return (
      <div className="flex flex-wrap gap-1.5">
        {correct.map((opt, i) => (
          <span
            key={`correct-${i}`}
            className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--success-border)] bg-[color:var(--success-soft)] px-2 py-0.5 text-xs font-semibold text-[color:var(--success-strong)]"
          >
            {opt.text}
          </span>
        ))}
      </div>
    );
  }

  if (question.questionFormat === "true_false") {
    return (
      <span
        className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-bold ${
          question.correctBoolean
            ? "border-[color:var(--success-border)] bg-[color:var(--success-soft)] text-[color:var(--success)]"
            : "border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] text-[color:var(--danger)]"
        }`}
      >
        {question.correctBoolean ? t.quiz.trueLabel : t.quiz.falseLabel}
      </span>
    );
  }

  return null;
}

export function BrowseQuestionCard({ question }: { question: QuizQuestion }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <article
      className={`rounded-xl border-2 bg-[color:var(--surface-strong)] transition-all duration-200 ${
        isOpen
          ? "border-[color:var(--accent-border)] shadow-[0_8px_30px_rgba(109,40,217,0.10)]"
          : "border-[color:var(--border)] shadow-[0_2px_8px_rgba(22,26,32,0.04)] hover:border-[color:var(--accent-border)]"
      }`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <QuestionMetaStrip question={question} />
          </div>
          <h3 className="mt-2 text-[15px] font-bold leading-snug text-[color:var(--text-strong)]">
            {question.prompt}
          </h3>
          <p className="mt-1 text-xs text-[color:var(--text-soft)]">
            {question.term} &middot; {question.sourceSection}
          </p>
        </div>

        <span
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs text-[color:var(--text-soft)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          &#9662;
        </span>
      </button>

      {/* Accordion body */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 border-t border-[color:var(--border)] px-4 pb-4 pt-3">
            {/* Correct answer badge */}
            <CorrectAnswerBadge question={question} t={t} />

            {/* Reference answer - compact */}
            <div className="rounded-lg bg-[color:var(--surface-muted)] p-3 text-[13px] leading-6">
              <QuestionRichText content={question.referenceAnswerMd} />
            </div>

            {/* Key points as inline chips */}
            {question.expectedAnswerPoints.length > 0 && (
              <div>
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-[color:var(--success)]">
                  {t.questionDetail.keyPoints}
                </p>
                <ul className="space-y-1 text-[13px] leading-5 text-[color:var(--text-strong)]">
                  {question.expectedAnswerPoints.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[color:var(--success)]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Common mistakes - compact */}
            {question.commonMistakes.length > 0 && (
              <div>
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-[color:var(--warning)]">
                  {t.questionDetail.pitfalls}
                </p>
                <ul className="space-y-1 text-[13px] leading-5 text-[color:var(--text-soft)]">
                  {question.commonMistakes.map((mistake) => (
                    <li key={mistake} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[color:var(--warning)]" />
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[color:var(--border)] pt-2">
              <ReviewToggleButton questionId={question.id} />
              <Link
                href={`/question/${question.id}`}
                className="text-xs font-semibold text-[color:var(--accent)] transition hover:text-[color:var(--accent-strong)]"
              >
                {t.questionDetail.fullCard} &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
