"use client";

import type { Difficulty, QuizQuestion } from "@/lib/questions/types";

const ACTIVE_SESSION_KEY = "techquiz.active-session";
const QUIZ_HISTORY_KEY = "techquiz.quiz-history";
const REVIEW_IDS_KEY = "techquiz.review-ids";
const STREAK_KEY = "techquiz.streak";
const XP_KEY = "techquiz.xp";
export const SESSION_EVENT = "techquiz:session-updated";
export const HISTORY_EVENT = "techquiz:history-updated";
export const REVIEW_EVENT = "techquiz:review-updated";
export const STREAK_EVENT = "techquiz:streak-updated";

export interface QuizSettingsSnapshot {
  questionCount: number;
  category: string;
  difficulty: Difficulty | "all";
}

export type AnswerStatus =
  | "pending"
  | "correct"
  | "incorrect"
  | "self_assessed_correct"
  | "self_assessed_incorrect";

export interface StoredQuizAnswer {
  questionId: string;
  status: AnswerStatus;
  selectedOptionIndexes?: number[];
  booleanAnswer?: boolean;
  freeTextAnswer?: string;
  submittedAt: string;
}

export interface ActiveQuizSession {
  startedAt: string;
  currentIndex: number;
  questionIds: string[];
  answers: StoredQuizAnswer[];
  settings: QuizSettingsSnapshot;
}

export interface QuizHistoryEntry {
  finishedAt: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  settings: QuizSettingsSnapshot;
  missedQuestionIds: string[];
  categoryBreakdown: Array<{ category: string; total: number; correct: number }>;
}

function safeParse<T>(value: string | null, fallback: T) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getActiveQuizSession() {
  if (typeof window === "undefined") {
    return null;
  }

  return safeParse<ActiveQuizSession | null>(window.localStorage.getItem(ACTIVE_SESSION_KEY), null);
}

export function saveActiveQuizSession(session: ActiveQuizSession) {
  window.localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function clearActiveQuizSession() {
  window.localStorage.removeItem(ACTIVE_SESSION_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function getReviewIds() {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  return safeParse<string[]>(window.localStorage.getItem(REVIEW_IDS_KEY), []);
}

export function toggleReviewId(questionId: string) {
  const current = new Set(getReviewIds());

  if (current.has(questionId)) {
    current.delete(questionId);
  } else {
    current.add(questionId);
  }

  const next = [...current];
  window.localStorage.setItem(REVIEW_IDS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(REVIEW_EVENT));
  return next;
}

export function appendQuizHistory(entry: QuizHistoryEntry) {
  const current = getQuizHistory();
  const next = [entry, ...current].slice(0, 20);
  window.localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(HISTORY_EVENT));
}

export function getQuizHistory() {
  if (typeof window === "undefined") {
    return [] as QuizHistoryEntry[];
  }

  return safeParse<QuizHistoryEntry[]>(window.localStorage.getItem(QUIZ_HISTORY_KEY), []);
}

/* ─── Streak system ─── */

interface StreakData {
  currentStreak: number;
  lastActiveDate: string;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getYesterday(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function getStreak(): StreakData {
  if (typeof window === "undefined") {
    return { currentStreak: 0, lastActiveDate: "" };
  }

  const data = safeParse<StreakData>(window.localStorage.getItem(STREAK_KEY), {
    currentStreak: 0,
    lastActiveDate: "",
  });

  const today = getToday();
  const yesterday = getYesterday();

  if (data.lastActiveDate !== today && data.lastActiveDate !== yesterday) {
    return { currentStreak: 0, lastActiveDate: data.lastActiveDate };
  }

  return data;
}

export function recordStreakActivity(): StreakData {
  const current = getStreak();
  const today = getToday();

  if (current.lastActiveDate === today) {
    return current;
  }

  const yesterday = getYesterday();
  const nextStreak =
    current.lastActiveDate === yesterday ? current.currentStreak + 1 : 1;

  const next: StreakData = { currentStreak: nextStreak, lastActiveDate: today };
  window.localStorage.setItem(STREAK_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(STREAK_EVENT));
  return next;
}

/* ─── XP system ─── */

const XP_PER_DIFFICULTY: Record<string, number> = {
  junior: 10,
  mid: 20,
  senior: 30,
};

export function getTotalXp(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  return safeParse<number>(window.localStorage.getItem(XP_KEY), 0);
}

export function addXp(difficulty: string): number {
  const points = XP_PER_DIFFICULTY[difficulty] ?? 10;
  const total = getTotalXp() + points;
  window.localStorage.setItem(XP_KEY, JSON.stringify(total));
  return points;
}

export function buildCategoryBreakdown(
  questions: QuizQuestion[],
  answers: StoredQuizAnswer[],
): QuizHistoryEntry["categoryBreakdown"] {
  const byId = new Map(questions.map((question) => [question.id, question]));
  const counters = new Map<string, { category: string; total: number; correct: number }>();

  for (const answer of answers) {
    const question = byId.get(answer.questionId);

    if (!question) {
      continue;
    }

    const counter = counters.get(question.category) ?? {
      category: question.categoryLabel,
      total: 0,
      correct: 0,
    };

    counter.total += 1;

    if (answer.status === "correct" || answer.status === "self_assessed_correct") {
      counter.correct += 1;
    }

    counters.set(question.category, counter);
  }

  return [...counters.values()].sort((left, right) => right.total - left.total);
}
