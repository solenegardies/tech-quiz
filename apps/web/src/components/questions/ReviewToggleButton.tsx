"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { REVIEW_EVENT, toggleReviewId, getReviewIds } from "@/lib/quiz/storage";

export function ReviewToggleButton({
  questionId,
  className = "",
}: {
  questionId: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const [isMarked, setIsMarked] = useState(false);

  useEffect(() => {
    const sync = () => setIsMarked(getReviewIds().includes(questionId));

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(REVIEW_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(REVIEW_EVENT, sync);
    };
  }, [questionId]);

  return (
    <button
      type="button"
      onClick={() => {
        toggleReviewId(questionId);
        setIsMarked(getReviewIds().includes(questionId));
      }}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        isMarked
          ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]"
          : "border-[color:var(--border)] bg-[color:var(--surface-strong)] text-[color:var(--text-soft)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent-strong)]"
      } ${className}`}
    >
      {isMarked ? t.questionDetail.inMyReviews : t.questionDetail.toReview}
    </button>
  );
}
