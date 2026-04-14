"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { renderInlineMarkdown, QuestionRichText } from "@/components/questions/QuestionRichText";
import type { QuizQuestion } from "@/lib/questions/types";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function QuestionOptions({ question }: { question: QuizQuestion }) {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);

  if (question.questionFormat === "free_text") {
    return (
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-[color:var(--text-strong)]">
          {t.questionDetail.openQuestion}
        </h2>
        <p className="text-sm leading-6 text-[color:var(--text-soft)]">
          {t.questionDetail.openQuestionHint}
        </p>
        <button
          type="button"
          onClick={() => setRevealed(!revealed)}
          className="btn-raised rounded-xl border-2 border-[color:var(--accent)] bg-[color:var(--accent)] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
        >
          {revealed ? t.questionDetail.hideAnswer : t.questionDetail.showAnswer}
        </button>
        {revealed && (
          <div className="rounded-xl border-2 border-[color:var(--success-border)] bg-[color:var(--success-soft)] p-4">
            <p className="text-sm leading-6 text-[color:var(--text-strong)]">
              {t.questionDetail.seeDetailedAnswer}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (question.questionFormat === "true_false") {
    return (
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-[color:var(--text-strong)]">
          {t.quiz.trueOrFalse}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <OptionButton
            label={t.quiz.trueLabel}
            letter="V"
            isCorrect={question.correctBoolean === true}
            revealed={revealed}
            onReveal={() => setRevealed(true)}
          />
          <OptionButton
            label={t.quiz.falseLabel}
            letter="F"
            isCorrect={question.correctBoolean === false}
            revealed={revealed}
            onReveal={() => setRevealed(true)}
          />
        </div>
        {revealed && question.booleanExplanation && (
          <div className="rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
            <QuestionRichText content={question.booleanExplanation} />
          </div>
        )}
      </div>
    );
  }

  // MCQ
  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-bold text-[color:var(--text-strong)]">
        {question.allowsMultipleAnswers
          ? t.quiz.multipleAnswers
          : t.quiz.singleAnswer}
      </h2>
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <OptionButton
            key={index}
            label={option.text}
            letter={OPTION_LETTERS[index] ?? String(index + 1)}
            isCorrect={option.isCorrect}
            revealed={revealed}
            onReveal={() => setRevealed(true)}
          />
        ))}
      </div>
    </div>
  );
}

function OptionButton({
  label,
  letter,
  isCorrect,
  revealed,
  onReveal,
}: {
  label: string;
  letter: string;
  isCorrect: boolean;
  revealed: boolean;
  onReveal: () => void;
}) {
  const [selected, setSelected] = useState(false);

  function handleClick() {
    if (revealed) return;
    setSelected(true);
    onReveal();
  }

  let borderClass =
    "border-[color:var(--border)] bg-[color:var(--surface-muted)]";
  let letterBg = "bg-[color:var(--surface-strong)] text-[color:var(--text-soft)]";

  if (revealed) {
    if (isCorrect) {
      borderClass = "border-[color:var(--success)] bg-[color:var(--success-soft)]";
      letterBg = "bg-[color:var(--success)] text-white";
    } else if (selected) {
      borderClass = "border-[color:var(--danger)] bg-[color:var(--danger-soft)]";
      letterBg = "bg-[color:var(--danger)] text-white";
    } else {
      borderClass = "border-[color:var(--border)] bg-[color:var(--surface-muted)] opacity-60";
      letterBg = "bg-[color:var(--surface-muted)] text-[color:var(--text-soft)]";
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={revealed}
      className={`flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition ${borderClass} ${
        revealed ? "cursor-default" : "hover:border-[color:var(--accent)] hover:-translate-y-0.5 cursor-pointer"
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${letterBg}`}
      >
        {revealed && isCorrect ? "✓" : revealed && selected ? "✗" : letter}
      </span>
      <span className="text-sm font-medium leading-6 text-[color:var(--text-strong)]">
        {renderInlineMarkdown(label)}
      </span>
    </button>
  );
}
