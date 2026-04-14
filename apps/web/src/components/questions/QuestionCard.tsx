import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { QuestionMetaStrip } from "@/components/questions/QuestionMetaStrip";
import { ReviewToggleButton } from "@/components/questions/ReviewToggleButton";
import type { QuizQuestion } from "@/lib/questions/types";

export function QuestionCard({ question }: { question: QuizQuestion }) {
  const t = getDictionary();

  return (
    <article className="group rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5 shadow-[0_12px_40px_rgba(22,26,32,0.06)] transition duration-200 hover:-translate-y-1 hover:border-[color:var(--accent)] hover:shadow-[0_20px_50px_rgba(109,40,217,0.12)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <QuestionMetaStrip question={question} />
        <ReviewToggleButton questionId={question.id} />
      </div>

      <Link href={`/question/${question.id}`} className="block space-y-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--text-soft)]">
            {question.term}
          </p>
          <h3 className="mt-2 font-display text-lg font-bold leading-tight text-[color:var(--text-strong)] group-hover:text-[color:var(--accent-strong)]">
            {question.prompt}
          </h3>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-[color:var(--text-soft)]">
          {question.referenceAnswerMd}
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-[color:var(--text-soft)]">{question.sourceSection}</span>
          <span className="rounded-lg bg-[color:var(--accent-soft)] px-2.5 py-1 text-xs font-bold text-[color:var(--accent-strong)] opacity-0 transition group-hover:opacity-100">
            {t.browse.view} &rarr;
          </span>
        </div>
      </Link>
    </article>
  );
}
