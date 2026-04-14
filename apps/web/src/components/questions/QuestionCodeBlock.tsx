import { getDictionary } from "@/lib/i18n";
import type { QuestionCodeSnippet } from "@/lib/questions/types";

export function QuestionCodeBlock({ snippet, label }: { snippet: QuestionCodeSnippet; label?: string }) {
  const t = getDictionary();

  return (
    <div className="overflow-hidden rounded-[24px] border border-[color:var(--border)] bg-[color:var(--code-bg)] shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.24em] text-[color:var(--code-soft)]">
        <span>{label ?? t.questionDetail.excerpt}</span>
        {snippet.language ? <span>{snippet.language}</span> : null}
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-6 text-[color:var(--code-text)]">
        <code>{snippet.code}</code>
      </pre>
    </div>
  );
}
