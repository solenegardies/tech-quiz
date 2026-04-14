"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import {
  HISTORY_EVENT,
  REVIEW_EVENT,
  SESSION_EVENT,
  STREAK_EVENT,
  getActiveQuizSession,
  getQuizHistory,
  getReviewIds,
  getStreak,
  getTotalXp,
  type QuizHistoryEntry,
} from "@/lib/quiz/storage";

function useHomeSnapshot() {
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [reviewIds, setReviewIds] = useState<string[]>([]);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    const sync = () => {
      setHistory(getQuizHistory());
      setReviewIds(getReviewIds());
      setHasActiveSession(Boolean(getActiveQuizSession()));
      setStreak(getStreak().currentStreak);
      setXp(getTotalXp());
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(REVIEW_EVENT, sync);
    window.addEventListener(SESSION_EVENT, sync);
    window.addEventListener(HISTORY_EVENT, sync);
    window.addEventListener(STREAK_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(REVIEW_EVENT, sync);
      window.removeEventListener(SESSION_EVENT, sync);
      window.removeEventListener(HISTORY_EVENT, sync);
      window.removeEventListener(STREAK_EVENT, sync);
    };
  }, []);

  return { history, reviewIds, hasActiveSession, streak, xp };
}

function MiniScoreRing({ percentage }: { percentage: number }) {
  const dashLength = (percentage / 100) * 264;
  const color =
    percentage >= 80
      ? "var(--success)"
      : percentage >= 50
        ? "var(--xp-gold)"
        : "var(--danger)";

  return (
    <svg viewBox="0 0 100 100" className="h-16 w-16">
      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface-muted)" strokeWidth="8" />
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dashLength} 264`}
        transform="rotate(-90 50 50)"
      />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--text-strong)"
        className="font-display text-xl font-bold"
      >
        {percentage}%
      </text>
    </svg>
  );
}

export function HomeClientPanels() {
  const { history, reviewIds, hasActiveSession, streak, xp } = useHomeSnapshot();
  const { t } = useTranslation();
  const quizCount = history.length;
  const averageScore = quizCount
    ? Math.round(
        history.reduce((total, item) => total + (item.correctCount / item.totalQuestions) * 100, 0) /
          quizCount,
      )
    : 0;
  const topCategoryMap = new Map<string, { category: string; total: number }>();

  for (const entry of history) {
    for (const item of entry.categoryBreakdown) {
      const existing = topCategoryMap.get(item.category) ?? { category: item.category, total: 0 };
      existing.total += item.total;
      topCategoryMap.set(item.category, existing);
    }
  }

  const topCategory = [...topCategoryMap.values()].sort((left, right) => right.total - left.total)[0];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Session + gamification */}
      <section className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-[0_20px_60px_rgba(22,26,32,0.08)]">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--text-soft)]">
            {t.home.yourProgress}
          </p>
          {/* Streak + XP badges */}
          <div className="flex items-center gap-2">
            {streak > 0 ? (
              <div className="flex items-center gap-1 rounded-full bg-[color:var(--xp-gold-soft)] px-2.5 py-1 border border-[rgba(245,158,11,0.2)]">
                <span className="text-xs">*</span>
                <span className="text-xs font-bold tabular-nums text-[color:var(--streak-orange)]">{streak}j</span>
              </div>
            ) : null}
            {xp > 0 ? (
              <div className="flex items-center gap-1 rounded-full bg-[color:var(--accent-soft)] px-2.5 py-1 border border-[color:var(--accent-border)]">
                <span className="text-xs font-bold text-[color:var(--accent-strong)]">{xp} XP</span>
              </div>
            ) : null}
          </div>
        </div>

        <h3 className="mt-3 font-display text-xl font-bold text-[color:var(--text-strong)]">
          {hasActiveSession ? t.home.quizWaiting : t.home.readyForRun}
        </h3>
        <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
          {hasActiveSession
            ? t.home.resumeDescription
            : t.home.noActiveSession}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={hasActiveSession ? "/quiz?resume=1" : "/quiz"}
            className="btn-raised inline-flex items-center rounded-xl border-2 border-[color:var(--accent-strong)] bg-[color:var(--accent)] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(109,40,217,0.35)] transition hover:bg-[color:var(--accent-strong)]"
          >
            {hasActiveSession ? t.home.resume : t.home.launchQuiz}
          </Link>
          <Link
            href="/browse"
            className="btn-raised inline-flex items-center rounded-xl border-2 border-[color:var(--border)] px-5 py-2.5 text-sm font-bold text-[color:var(--text-strong)] transition hover:bg-[color:var(--surface-muted)]"
          >
            {t.home.explore}
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-[0_20px_60px_rgba(22,26,32,0.08)]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--text-soft)]">
          {t.home.personalStats}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--accent-soft)]">
              <span className="text-sm font-bold text-[color:var(--accent-strong)]">#</span>
            </div>
            <div>
              <p className="text-xs text-[color:var(--text-soft)]">{t.home.quizzesLaunched}</p>
              <p className="font-display text-2xl font-bold tabular-nums text-[color:var(--text-strong)]">
                {quizCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
            {quizCount > 0 ? (
              <>
                <MiniScoreRing percentage={averageScore} />
                <div>
                  <p className="text-xs text-[color:var(--text-soft)]">{t.home.averageScore}</p>
                </div>
              </>
            ) : (
              <div>
                <p className="text-xs text-[color:var(--text-soft)]">{t.home.averageScore}</p>
                <p className="font-display text-2xl font-bold text-[color:var(--text-soft)]">-</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--warning-soft)]">
              <span className="text-sm font-bold text-[color:var(--warning)]">!</span>
            </div>
            <div>
              <p className="text-xs text-[color:var(--text-soft)]">{t.home.toReview}</p>
              <p className="font-display text-2xl font-bold tabular-nums text-[color:var(--text-strong)]">
                {reviewIds.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--success-soft)]">
              <span className="text-sm font-bold text-[color:var(--success)]">*</span>
            </div>
            <div>
              <p className="text-xs text-[color:var(--text-soft)]">{t.home.topTheme}</p>
              <p className="text-sm font-bold text-[color:var(--text-strong)] leading-tight">
                {topCategory?.category ?? t.common.none}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
