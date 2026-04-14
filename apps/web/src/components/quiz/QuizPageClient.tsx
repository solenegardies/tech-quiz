"use client";

import Link from "next/link";
import confetti from "canvas-confetti";
import { startTransition, useEffect, useEffectEvent, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { QuestionCodeBlock } from "@/components/questions/QuestionCodeBlock";
import { QuestionMetaStrip } from "@/components/questions/QuestionMetaStrip";
import { QuestionRichText } from "@/components/questions/QuestionRichText";
import { ReviewToggleButton } from "@/components/questions/ReviewToggleButton";
import type { QuestionMeta, QuizQuestion, Difficulty } from "@/lib/questions/types";
import {
  addXp,
  appendQuizHistory,
  buildCategoryBreakdown,
  clearActiveQuizSession,
  getActiveQuizSession,
  recordStreakActivity,
  saveActiveQuizSession,
  type ActiveQuizSession,
  type AnswerStatus,
  type QuizSettingsSnapshot,
  type StoredQuizAnswer,
} from "@/lib/quiz/storage";

/* ─── Helpers ─── */

interface QuizPageClientProps {
  meta: QuestionMeta;
  resumeRequested?: boolean;
}

type ScreenState = "setup" | "loading" | "playing" | "summary";

function isSuccessfulStatus(status: AnswerStatus) {
  return status === "correct" || status === "self_assessed_correct";
}

function isFailedStatus(status: AnswerStatus) {
  return status === "incorrect" || status === "self_assessed_incorrect";
}

function areSameIndexes(left: number[], right: number[]) {
  if (left.length !== right.length) {
    return false;
  }

  const leftSorted = [...left].sort((a, b) => a - b);
  const rightSorted = [...right].sort((a, b) => a - b);

  return leftSorted.every((value, index) => value === rightSorted[index]);
}

function getDefaultSettings(): QuizSettingsSnapshot {
  return {
    questionCount: 7,
    category: "all",
    difficulty: "all",
  };
}

function fireConfetti() {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.65 },
    colors: ["#58cc02", "#6d28d9", "#ff9600", "#1cb0f6", "#ffc800", "#ff4ea3"],
  });
}

/* ─── Score Ring SVG ─── */

function ScoreRing({ correct, total }: { correct: number; total: number }) {
  const ratio = total > 0 ? correct / total : 0;
  const dashLength = ratio * 264;
  const percentage = Math.round(ratio * 100);

  const color =
    percentage >= 80
      ? "var(--success)"
      : percentage >= 50
        ? "var(--xp-gold)"
        : "var(--danger)";

  return (
    <div className="relative inline-flex items-center justify-center animate-bounce-in">
      <svg viewBox="0 0 100 100" className="h-44 w-44">
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="var(--surface-muted)"
          strokeWidth="8"
        />
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
          className="animate-ring-fill"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-bold tabular-nums text-[color:var(--text-strong)]">
          {percentage}%
        </span>
        <span className="text-sm font-medium text-[color:var(--text-soft)]">
          {correct}/{total}
        </span>
      </div>
    </div>
  );
}

/* ─── XP Popup ─── */

function XpPopup({ amount, show }: { amount: number; show: boolean }) {
  if (!show) {
    return null;
  }

  return (
    <div className="animate-xp-float absolute -top-2 right-4 z-10 rounded-full bg-[color:var(--xp-gold-soft)] px-3 py-1 text-base font-bold text-[color:var(--xp-gold)]">
      +{amount} XP
    </div>
  );
}

/* ─── Format indicator icons ─── */

function FormatIndicator({ format, allowsMultiple, t }: { format: string; allowsMultiple?: boolean; t: ReturnType<typeof useTranslation>["t"] }) {
  if (format === "mcq") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-[color:var(--accent-soft)] border border-[color:var(--accent-border)] px-3 py-1.5">
        <span className="text-sm font-bold text-[color:var(--accent-strong)]">
          {allowsMultiple ? t.quiz.multipleAnswers : t.quiz.singleAnswer}
        </span>
      </div>
    );
  }

  if (format === "true_false") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-[color:var(--warning-soft)] border border-[color:var(--warning-border)] px-3 py-1.5">
        <span className="text-sm font-bold text-[color:var(--warning)]">{t.quiz.trueOrFalse}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl bg-[color:var(--success-soft)] border border-[color:var(--success-border)] px-3 py-1.5">
      <span className="text-sm font-bold text-[color:var(--success)]">{t.quiz.freeAnswer}</span>
    </div>
  );
}

/* ─── Main Component ─── */

export function QuizPageClient({ meta, resumeRequested = false }: QuizPageClientProps) {
  const { t } = useTranslation();
  const [screen, setScreen] = useState<ScreenState>("setup");
  const [settings, setSettings] = useState<QuizSettingsSnapshot>(getDefaultSettings());
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<StoredQuizAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedOptionIndexes, setSelectedOptionIndexes] = useState<number[]>([]);
  const [selectedBoolean, setSelectedBoolean] = useState<boolean | null>(null);
  const [freeTextAnswer, setFreeTextAnswer] = useState("");
  const [hasStoredSession, setHasStoredSession] = useState(false);
  const [shakeCard, setShakeCard] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [showXp, setShowXp] = useState(false);
  const [progressGlow, setProgressGlow] = useState(false);
  const [questionKey, setQuestionKey] = useState(0);
  const restoredSessionRef = useRef(false);

  const currentQuestion = questions[currentIndex] ?? null;
  const currentAnswer = currentQuestion
    ? answers.find((answer) => answer.questionId === currentQuestion.id) ?? null
    : null;
  const correctCount = answers.filter((answer) => isSuccessfulStatus(answer.status)).length;
  const incorrectCount = answers.filter((answer) => isFailedStatus(answer.status)).length;
  const progressRatio = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;

  function syncDraftState(question: QuizQuestion | null, answer: StoredQuizAnswer | null) {
    if (!question || !answer) {
      setSelectedOptionIndexes([]);
      setSelectedBoolean(null);
      setFreeTextAnswer("");
      return;
    }

    setSelectedOptionIndexes(answer.selectedOptionIndexes ?? []);
    setSelectedBoolean(answer.booleanAnswer ?? null);
    setFreeTextAnswer(answer.freeTextAnswer ?? "");
  }

  async function fetchQuestions(query: URLSearchParams) {
    const response = await fetch(`/internal/quiz?${query.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(t.quiz.loadError);
    }

    const payload = (await response.json()) as { questions: QuizQuestion[] };
    return payload.questions;
  }

  async function resumeQuiz() {
    const session = getActiveQuizSession();

    if (!session) {
      setErrorMessage(t.quiz.noRecentSession);
      setScreen("setup");
      setHasStoredSession(false);
      return;
    }

    setScreen("loading");
    setErrorMessage("");

    try {
      const query = new URLSearchParams();
      query.set("ids", session.questionIds.join(","));
      const nextQuestions = await fetchQuestions(query);

      if (!nextQuestions.length) {
        clearActiveQuizSession();
        setScreen("setup");
        setHasStoredSession(false);
        setErrorMessage(t.quiz.sessionUnavailable);
        return;
      }

      startTransition(() => {
        setSettings(session.settings);
        setQuestions(nextQuestions);
        setAnswers(session.answers);
        const nextIndex = Math.min(session.currentIndex, nextQuestions.length - 1);
        const nextQuestion = nextQuestions[nextIndex] ?? null;
        const nextAnswer = nextQuestion
          ? session.answers.find((answer) => answer.questionId === nextQuestion.id) ?? null
          : null;
        setCurrentIndex(nextIndex);
        syncDraftState(nextQuestion, nextAnswer);
        setScreen("playing");
      });
      setHasStoredSession(true);
    } catch (error) {
      setScreen("setup");
      setErrorMessage(error instanceof Error ? error.message : t.quiz.resumeError);
    }
  }

  const resumeQuizOnMount = useEffectEvent(async () => {
    await resumeQuiz();
  });

  useEffect(() => {
    const syncSessionFlag = () => setHasStoredSession(Boolean(getActiveQuizSession()));

    syncSessionFlag();
    window.addEventListener("storage", syncSessionFlag);

    return () => {
      window.removeEventListener("storage", syncSessionFlag);
    };
  }, []);

  useEffect(() => {
    if (!resumeRequested || restoredSessionRef.current) {
      return;
    }

    restoredSessionRef.current = true;
    const timeoutId = window.setTimeout(() => {
      void resumeQuizOnMount();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [resumeRequested]);

  function persistSession(nextQuestions: QuizQuestion[], nextAnswers: StoredQuizAnswer[], nextIndex: number) {
    if (!nextQuestions.length) {
      return;
    }

    const session: ActiveQuizSession = {
      startedAt: getActiveQuizSession()?.startedAt ?? new Date().toISOString(),
      currentIndex: nextIndex,
      questionIds: nextQuestions.map((question) => question.id),
      answers: nextAnswers,
      settings,
    };

    saveActiveQuizSession(session);
    setHasStoredSession(true);
  }

  function applyAnswer(nextAnswer: StoredQuizAnswer) {
    const nextAnswers = [
      ...answers.filter((answer) => answer.questionId !== nextAnswer.questionId),
      nextAnswer,
    ];

    setAnswers(nextAnswers);
    persistSession(questions, nextAnswers, currentIndex);
  }

  function triggerCorrectFeedback() {
    if (!currentQuestion) {
      return;
    }

    setProgressGlow(true);
    setTimeout(() => setProgressGlow(false), 800);

    const earned = addXp(currentQuestion.difficulty);
    setXpGained(earned);
    setShowXp(true);
    setTimeout(() => setShowXp(false), 1200);
  }

  function triggerIncorrectFeedback() {
    setShakeCard(true);
    setTimeout(() => setShakeCard(false), 500);
  }

  async function startQuizWithIds(ids?: string[]) {
    setScreen("loading");
    setErrorMessage("");

    try {
      const query = new URLSearchParams();

      if (ids?.length) {
        query.set("ids", ids.join(","));
      } else {
        query.set("questionCount", String(settings.questionCount));
        query.set("category", settings.category);
        query.set("difficulty", settings.difficulty);
      }

      const nextQuestions = await fetchQuestions(query);

      if (!nextQuestions.length) {
        setScreen("setup");
        setErrorMessage(t.quiz.noMatchingQuestions);
        return;
      }

      startTransition(() => {
        setQuestions(nextQuestions);
        setAnswers([]);
        setCurrentIndex(0);
        setQuestionKey((prev) => prev + 1);
        syncDraftState(nextQuestions[0] ?? null, null);
        setScreen("playing");
      });

      saveActiveQuizSession({
        startedAt: new Date().toISOString(),
        currentIndex: 0,
        questionIds: nextQuestions.map((question) => question.id),
        answers: [],
        settings,
      });
      setHasStoredSession(true);
    } catch (error) {
      setScreen("setup");
      setErrorMessage(error instanceof Error ? error.message : t.quiz.loadingError);
    }
  }

  function submitCurrentAnswer() {
    if (!currentQuestion || currentAnswer) {
      return;
    }

    if (currentQuestion.questionFormat === "mcq") {
      if (!selectedOptionIndexes.length) {
        return;
      }

      const isCorrect = areSameIndexes(selectedOptionIndexes, currentQuestion.correctOptionIndexes);
      applyAnswer({
        questionId: currentQuestion.id,
        status: isCorrect ? "correct" : "incorrect",
        selectedOptionIndexes,
        submittedAt: new Date().toISOString(),
      });

      if (isCorrect) {
        triggerCorrectFeedback();
      } else {
        triggerIncorrectFeedback();
      }

      return;
    }

    if (currentQuestion.questionFormat === "true_false") {
      if (selectedBoolean === null) {
        return;
      }

      const isCorrect = selectedBoolean === currentQuestion.correctBoolean;
      applyAnswer({
        questionId: currentQuestion.id,
        status: isCorrect ? "correct" : "incorrect",
        booleanAnswer: selectedBoolean,
        submittedAt: new Date().toISOString(),
      });

      if (isCorrect) {
        triggerCorrectFeedback();
      } else {
        triggerIncorrectFeedback();
      }

      return;
    }

    applyAnswer({
      questionId: currentQuestion.id,
      status: "pending",
      freeTextAnswer: freeTextAnswer.trim(),
      submittedAt: new Date().toISOString(),
    });
  }

  function selfAssessCurrent(isCorrect: boolean) {
    if (!currentQuestion || !currentAnswer || currentQuestion.questionFormat !== "free_text") {
      return;
    }

    const nextAnswer: StoredQuizAnswer = {
      ...currentAnswer,
      status: isCorrect ? "self_assessed_correct" : "self_assessed_incorrect",
    };

    applyAnswer(nextAnswer);

    if (isCorrect) {
      triggerCorrectFeedback();
    } else {
      triggerIncorrectFeedback();
    }
  }

  function finishQuiz(finalAnswers: StoredQuizAnswer[]) {
    const finalCorrectCount = finalAnswers.filter((answer) => isSuccessfulStatus(answer.status)).length;
    const finalIncorrectCount = finalAnswers.filter((answer) => isFailedStatus(answer.status)).length;
    const missedQuestionIds = finalAnswers
      .filter((answer) => isFailedStatus(answer.status))
      .map((answer) => answer.questionId);

    appendQuizHistory({
      finishedAt: new Date().toISOString(),
      score: finalCorrectCount,
      totalQuestions: questions.length,
      correctCount: finalCorrectCount,
      incorrectCount: finalIncorrectCount,
      settings,
      missedQuestionIds,
      categoryBreakdown: buildCategoryBreakdown(questions, finalAnswers),
    });

    recordStreakActivity();
    clearActiveQuizSession();
    setHasStoredSession(false);
    setScreen("summary");

    const successRate = questions.length ? finalCorrectCount / questions.length : 0;
    if (successRate >= 0.7) {
      setTimeout(fireConfetti, 300);
    }
  }

  function goToNextQuestion() {
    if (!currentAnswer || currentAnswer.status === "pending") {
      return;
    }

    const isLastQuestion = currentIndex === questions.length - 1;

    if (isLastQuestion) {
      finishQuiz(answers);
      return;
    }

    const nextIndex = currentIndex + 1;
    const nextQuestion = questions[nextIndex] ?? null;
    const nextAnswer = nextQuestion
      ? answers.find((answer) => answer.questionId === nextQuestion.id) ?? null
      : null;
    setCurrentIndex(nextIndex);
    setQuestionKey((prev) => prev + 1);
    syncDraftState(nextQuestion, nextAnswer);
    persistSession(questions, answers, nextIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ─── SETUP SCREEN ─── */

  function renderSetup() {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold tracking-tight text-[color:var(--text-strong)] sm:text-5xl">
            {t.quiz.readyForChallenge}
          </h1>
          <p className="mt-3 text-lg text-[color:var(--text-soft)]">
            {t.quiz.configureQuiz}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          {/* Stats cards */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 text-center">
                <p className="font-display text-3xl font-bold text-[color:var(--accent)]">{meta.totalQuestions}</p>
                <p className="mt-1 text-xs font-medium text-[color:var(--text-soft)]">{t.quiz.questionsLabel}</p>
              </div>
              <div className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 text-center">
                <p className="font-display text-3xl font-bold text-[color:var(--warning)]">{meta.categoryCount}</p>
                <p className="mt-1 text-xs font-medium text-[color:var(--text-soft)]">{t.quiz.categories}</p>
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-2xl border-2 border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] p-5">
              <p className="text-sm font-bold text-[color:var(--accent-strong)]">{t.quiz.howItWorks}</p>
              <ul className="mt-3 space-y-2 text-sm text-[color:var(--accent-strong)]">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-xs font-bold text-white">1</span>
                  <span>{t.quiz.step1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-xs font-bold text-white">2</span>
                  <span>{t.quiz.step2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-xs font-bold text-white">3</span>
                  <span>{t.quiz.step3}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Settings panel */}
          <div className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-[0_20px_60px_rgba(22,26,32,0.08)]">
            <h2 className="font-display text-xl font-bold text-[color:var(--text-strong)]">
              {t.quiz.configureRun}
            </h2>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[color:var(--text-soft)]">
                  {t.quiz.questionCount}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { count: 7, label: t.quiz.shortRun },
                    { count: 20, label: t.quiz.longRun },
                  ] as const).map(({ count, label }) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setSettings((current) => ({ ...current, questionCount: count }))}
                      className={`btn-raised rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition ${
                        settings.questionCount === count
                          ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]"
                          : "border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--text-strong)] hover:border-[color:var(--accent)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[color:var(--text-soft)]">
                  {t.quiz.difficulty}
                </span>
                <select
                  value={settings.difficulty}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      difficulty: event.target.value as Difficulty | "all",
                    }))
                  }
                  className="w-full rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-2.5 text-sm font-medium outline-none transition focus:border-[color:var(--accent)]"
                >
                  <option value="all">{t.quiz.allDifficulties}</option>
                  <option value="junior">{t.quiz.junior}</option>
                  <option value="mid">{t.quiz.mid}</option>
                  <option value="senior">{t.quiz.senior}</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[color:var(--text-soft)]">
                  {t.quiz.category}
                </span>
                <select
                  value={settings.category}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-2.5 text-sm font-medium outline-none transition focus:border-[color:var(--accent)]"
                >
                  <option value="all">{t.quiz.allCategories}</option>
                  {meta.categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label} ({category.count})
                    </option>
                  ))}
                </select>
              </label>

            </div>

            {errorMessage ? (
              <p className="mt-4 rounded-xl border-2 border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] px-4 py-3 text-sm font-medium text-[color:var(--danger)]">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3">
              <Button size="lg" className="w-full rounded-xl" onClick={() => void startQuizWithIds()}>
                {t.quiz.launchQuiz}
              </Button>
              {hasStoredSession ? (
                <Button variant="secondary" size="lg" className="w-full rounded-xl" onClick={() => void resumeQuiz()}>
                  {t.quiz.resumeSession}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── MCQ Options (Single + Multiple) ─── */

  function renderMcqOptions() {
    if (!currentQuestion || currentQuestion.questionFormat !== "mcq") {
      return null;
    }

    const answerRevealed = Boolean(currentAnswer);
    const isMultiple = currentQuestion.allowsMultipleAnswers;

    return (
      <div className="space-y-3">
        <FormatIndicator format="mcq" allowsMultiple={isMultiple} t={t} />
        <div className="space-y-2.5">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOptionIndexes.includes(index);
            const isCorrectOption = currentQuestion.correctOptionIndexes.includes(index);
            const isIncorrectSelection = answerRevealed && isSelected && !isCorrectOption;
            const letter = String.fromCharCode(65 + index);

            return (
              <button
                key={`${currentQuestion.id}-${index}`}
                type="button"
                disabled={answerRevealed}
                onClick={() => {
                  if (isMultiple) {
                    setSelectedOptionIndexes((current) =>
                      current.includes(index)
                        ? current.filter((value) => value !== index)
                        : [...current, index],
                    );
                    return;
                  }

                  setSelectedOptionIndexes([index]);
                }}
                style={{ animationDelay: `${index * 60}ms` }}
                className={`animate-option-in w-full flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left text-sm leading-6 transition select-none ${
                  answerRevealed
                    ? isCorrectOption
                      ? "border-[color:var(--success)] bg-[color:var(--success-soft)] animate-correct-pop"
                      : isIncorrectSelection
                        ? "border-[color:var(--danger)] bg-[color:var(--danger-soft)]"
                        : "border-[color:var(--border)] bg-[color:var(--surface-muted)] opacity-60"
                    : isSelected
                      ? "btn-raised border-[color:var(--accent)] bg-[color:var(--accent-soft)] shadow-[0_2px_8px_rgba(109,40,217,0.18)]"
                      : "btn-raised border-[color:var(--border)] bg-[color:var(--surface-strong)] hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)]/50"
                }`}
              >
                {/* Letter badge */}
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition ${
                    answerRevealed
                      ? isCorrectOption
                        ? "bg-[color:var(--success)] text-white"
                        : isIncorrectSelection
                          ? "bg-[color:var(--danger)] text-white"
                          : "bg-[color:var(--surface-muted)] text-[color:var(--text-soft)]"
                      : isSelected
                        ? "bg-[color:var(--accent)] text-white"
                        : "bg-[color:var(--surface-muted)] text-[color:var(--text-soft)]"
                  }`}
                >
                  {answerRevealed && isCorrectOption ? "✓" : answerRevealed && isIncorrectSelection ? "✗" : letter}
                </span>

                {/* Checkbox indicator for multiple */}
                {isMultiple && !answerRevealed ? (
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-xs transition ${
                      isSelected
                        ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                        : "border-[color:var(--border)] bg-transparent"
                    }`}
                  >
                    {isSelected ? "✓" : ""}
                  </span>
                ) : null}

                <span className="font-medium text-[color:var(--text-strong)]">{option.text}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ─── True/False ─── */

  function renderTrueFalse() {
    if (!currentQuestion || currentQuestion.questionFormat !== "true_false") {
      return null;
    }

    const answerRevealed = Boolean(currentAnswer);

    return (
      <div className="space-y-3">
        <FormatIndicator format="true_false" t={t} />
        <div className="grid gap-4 sm:grid-cols-2">
          {[true, false].map((value) => {
            const isSelected = selectedBoolean === value;
            const isCorrectChoice = currentQuestion.correctBoolean === value;
            const isWrongSelection = answerRevealed && isSelected && !isCorrectChoice;

            return (
              <button
                key={String(value)}
                type="button"
                disabled={answerRevealed}
                onClick={() => setSelectedBoolean(value)}
                className={`animate-option-in btn-raised group relative overflow-hidden rounded-2xl border-2 px-6 py-8 text-center transition select-none ${
                  answerRevealed
                    ? isCorrectChoice
                      ? "border-[color:var(--success)] bg-[color:var(--success-soft)] animate-correct-pop"
                      : isWrongSelection
                        ? "border-[color:var(--danger)] bg-[color:var(--danger-soft)]"
                        : "border-[color:var(--border)] bg-[color:var(--surface-muted)] opacity-60"
                    : isSelected
                      ? value
                        ? "border-[color:var(--success)] bg-[color:var(--success-soft)] shadow-[0_2px_12px_rgba(88,204,2,0.2)]"
                        : "border-[color:var(--danger)] bg-[color:var(--danger-soft)] shadow-[0_2px_12px_rgba(255,75,75,0.2)]"
                      : "border-[color:var(--border)] bg-[color:var(--surface-strong)] hover:border-[color:var(--accent)]"
                }`}
                style={{ animationDelay: value ? "0ms" : "80ms" }}
              >
                {/* Big icon */}
                <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold ${
                  answerRevealed
                    ? isCorrectChoice
                      ? "bg-[color:var(--success)] text-white"
                      : isWrongSelection
                        ? "bg-[color:var(--danger)] text-white"
                        : "bg-[color:var(--surface-muted)] text-[color:var(--text-soft)]"
                    : isSelected
                      ? value
                        ? "bg-[color:var(--success)] text-white"
                        : "bg-[color:var(--danger)] text-white"
                      : "bg-[color:var(--surface-muted)] text-[color:var(--text-soft)]"
                }`}>
                  {value ? "V" : "F"}
                </div>

                <p className="font-display text-2xl font-bold text-[color:var(--text-strong)]">
                  {value ? t.quiz.trueLabel : t.quiz.falseLabel}
                </p>

                {answerRevealed && isCorrectChoice ? (
                  <p className="mt-2 text-xs font-semibold text-[color:var(--success)]">{t.quiz.correctAnswer}</p>
                ) : answerRevealed && isWrongSelection ? (
                  <p className="mt-2 text-xs font-semibold text-[color:var(--danger)]">{t.quiz.wrongAnswer}</p>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ─── Free Text ─── */

  function renderFreeText() {
    if (!currentQuestion || currentQuestion.questionFormat !== "free_text") {
      return null;
    }

    return (
      <div className="space-y-3">
        <FormatIndicator format="free_text" t={t} />
        <div className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] p-1 transition focus-within:border-[color:var(--accent)] animate-option-in">
          <textarea
            value={freeTextAnswer}
            onChange={(event) => setFreeTextAnswer(event.target.value)}
            disabled={Boolean(currentAnswer)}
            rows={7}
            placeholder={t.quiz.freeTextPlaceholder}
            className="w-full rounded-xl bg-transparent px-4 py-3 text-sm leading-7 outline-none placeholder:text-[color:var(--text-soft)]/60 disabled:opacity-60"
          />
        </div>
        {!currentAnswer ? (
          <p className="text-xs text-[color:var(--text-soft)]">
            {t.quiz.freeTextHint}
          </p>
        ) : null}
      </div>
    );
  }

  /* ─── Question Body Router ─── */

  function renderQuestionBody() {
    if (!currentQuestion) {
      return null;
    }

    if (currentQuestion.questionFormat === "mcq") {
      return renderMcqOptions();
    }

    if (currentQuestion.questionFormat === "true_false") {
      return renderTrueFalse();
    }

    return renderFreeText();
  }

  /* ─── Feedback ─── */

  function renderFeedback() {
    if (!currentQuestion || !currentAnswer) {
      return null;
    }

    const isCorrect = isSuccessfulStatus(currentAnswer.status);
    const isIncorrect = isFailedStatus(currentAnswer.status);
    const isPending = currentAnswer.status === "pending";

    const toneClass = isCorrect
      ? "border-[color:var(--success)] bg-[color:var(--success-soft)]"
      : isIncorrect
        ? "border-[color:var(--danger)] bg-[color:var(--danger-soft)]"
        : "border-[color:var(--accent-border)] bg-[color:var(--accent-soft)]";

    const statusLabel = isCorrect ? t.quiz.correct : isIncorrect ? t.quiz.incorrect : t.quiz.toValidate;
    const statusIcon = isCorrect ? "✓" : isIncorrect ? "✗" : "?";

    const explanation =
      currentQuestion.questionFormat === "true_false"
        ? currentQuestion.booleanExplanation
        : currentQuestion.referenceAnswerMd;

    return (
      <section className={`animate-slide-up rounded-2xl border-2 p-6 ${toneClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white ${
                isCorrect ? "bg-[color:var(--success)]" : isIncorrect ? "bg-[color:var(--danger)]" : "bg-[color:var(--accent)]"
              }`}
            >
              {statusIcon}
            </span>
            <div>
              <h3 className="font-display text-xl font-bold text-[color:var(--text-strong)]">
                {statusLabel}
              </h3>
            </div>
          </div>
          <ReviewToggleButton questionId={currentQuestion.id} />
        </div>

        <div className="mt-5 rounded-xl bg-white/55 p-5">
          <QuestionRichText content={explanation} />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl bg-white/55 p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-[color:var(--text-strong)]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--accent)] text-xs text-white">V</span>
              {t.quiz.expectedPoints}
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--text-soft)]">
              {currentQuestion.expectedAnswerPoints.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-white/55 p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-[color:var(--text-strong)]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--warning)] text-xs text-white">!</span>
              {t.quiz.commonMistakes}
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--text-soft)]">
              {currentQuestion.commonMistakes.map((mistake) => (
                <li key={mistake} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--warning)]" />
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {currentQuestion.questionFormat === "free_text" && isPending ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="success" className="rounded-xl" onClick={() => selfAssessCurrent(true)}>
              {t.quiz.validateMyAnswer}
            </Button>
            <Button variant="danger" className="rounded-xl" onClick={() => selfAssessCurrent(false)}>
              {t.quiz.needsWork}
            </Button>
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="rounded-xl" onClick={goToNextQuestion}>
              {currentIndex === questions.length - 1 ? t.quiz.seeSummary : t.quiz.nextQuestion}
            </Button>
            <Link
              href={`/question/${currentQuestion.id}`}
              className="btn-raised inline-flex items-center rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-2.5 text-sm font-semibold text-[color:var(--text-strong)] transition hover:bg-white/60"
            >
              {t.quiz.openCard}
            </Link>
          </div>
        )}
      </section>
    );
  }

  /* ─── PLAYING SCREEN ─── */

  function renderPlaying() {
    if (!currentQuestion) {
      return null;
    }

    const canSubmit =
      (currentQuestion.questionFormat === "mcq" && selectedOptionIndexes.length > 0) ||
      (currentQuestion.questionFormat === "true_false" && selectedBoolean !== null) ||
      currentQuestion.questionFormat === "free_text";

    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Progress header */}
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--accent-soft)] font-display text-sm font-bold text-[color:var(--accent-strong)] tabular-nums">
                {currentIndex + 1}
              </span>
              <span className="text-sm font-medium text-[color:var(--text-soft)]">
                {t.quiz.onOf} {questions.length}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 font-semibold text-[color:var(--success)]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--success-soft)] text-xs">V</span>
                {correctCount}
              </span>
              <span className="flex items-center gap-1 font-semibold text-[color:var(--danger)]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--danger-soft)] text-xs">X</span>
                {incorrectCount}
              </span>
            </div>
          </div>

          {/* Animated progress bar */}
          <div className="h-3 overflow-hidden rounded-full bg-[color:var(--surface-muted)]">
            <div
              className={`h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--success))] progress-bar-fill ${progressGlow ? "animate-progress-glow" : ""}`}
              style={{ width: `${progressRatio}%` }}
            />
          </div>
        </div>

        {/* 2-column layout: enonce | reponses */}
        <div className="relative">
          <XpPopup amount={xpGained} show={showXp} />

          <div
            key={questionKey}
            className={`grid grid-cols-1 gap-5 md:grid-cols-2 ${shakeCard ? "animate-shake" : ""}`}
          >
            {/* Left column — enonce */}
            <section className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-[0_20px_60px_rgba(22,26,32,0.08)] md:p-8">
              {/* Meta */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <QuestionMetaStrip question={currentQuestion} />
                <ReviewToggleButton questionId={currentQuestion.id} />
              </div>

              {/* Prompt */}
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--text-soft)] mb-2">
                  {currentQuestion.term}
                </p>
                <h2 className="font-display text-2xl font-bold leading-snug text-[color:var(--text-strong)] sm:text-3xl">
                  {currentQuestion.prompt}
                </h2>
              </div>

              {/* Code */}
              {currentQuestion.codeSnippet ? (
                <div className="mt-6">
                  <QuestionCodeBlock snippet={currentQuestion.codeSnippet} />
                </div>
              ) : null}
            </section>

            {/* Right column — reponses */}
            <section className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-[0_20px_60px_rgba(22,26,32,0.08)] md:p-8">
              {/* Question body (per-type rendering) */}
              <div>{renderQuestionBody()}</div>

              {/* Submit button */}
              {!currentAnswer ? (
                <div className="mt-6 animate-fade-in">
                  <Button
                    size="lg"
                    className="w-full rounded-xl"
                    disabled={!canSubmit}
                    onClick={submitCurrentAnswer}
                  >
                    {currentQuestion.questionFormat === "free_text" ? t.quiz.seeCorrection : t.quiz.validate}
                  </Button>
                </div>
              ) : null}
            </section>
          </div>
        </div>

        {/* Feedback */}
        {currentAnswer ? <div className="mt-6">{renderFeedback()}</div> : null}
      </div>
    );
  }

  /* ─── SUMMARY SCREEN ─── */

  function renderSummary() {
    const missedQuestions = questions.filter((question) =>
      answers.some((answer) => answer.questionId === question.id && isFailedStatus(answer.status)),
    );
    const breakdown = buildCategoryBreakdown(questions, answers);
    const successRate = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

    const message =
      successRate >= 90
        ? t.quiz.exceptional
        : successRate >= 70
          ? t.quiz.wellDone
          : successRate >= 50
            ? t.quiz.notBad
            : t.quiz.keepGoing;

    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-in">
        {/* Hero score */}
        <section className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] p-8 text-center shadow-[0_20px_60px_rgba(22,26,32,0.08)]">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[color:var(--text-soft)]">
            {t.quiz.quizFinished}
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-[color:var(--text-strong)] sm:text-4xl">
            {message}
          </h1>

          <div className="mt-8 flex justify-center">
            <ScoreRing correct={correctCount} total={questions.length} />
          </div>

          {/* Stats row */}
          <div className="mt-8 flex justify-center gap-4">
            <div className="rounded-xl border-2 border-[color:var(--success-border)] bg-[color:var(--success-soft)] px-5 py-3 text-center">
              <p className="font-display text-2xl font-bold tabular-nums text-[color:var(--success)]">{correctCount}</p>
              <p className="text-xs font-semibold text-[color:var(--success)]">{t.quiz.correctAnswers}</p>
            </div>
            <div className="rounded-xl border-2 border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] px-5 py-3 text-center">
              <p className="font-display text-2xl font-bold tabular-nums text-[color:var(--danger)]">{incorrectCount}</p>
              <p className="text-xs font-semibold text-[color:var(--danger)]">{t.quiz.toReviewSummary}</p>
            </div>
            <div className="rounded-xl border-2 border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] px-5 py-3 text-center">
              <p className="font-display text-2xl font-bold tabular-nums text-[color:var(--accent-strong)]">{successRate}%</p>
              <p className="text-xs font-semibold text-[color:var(--accent-strong)]">{t.quiz.rate}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" className="rounded-xl" onClick={() => void startQuizWithIds()}>
              {t.quiz.newQuiz}
            </Button>
            {missedQuestions.length ? (
              <Button
                variant="danger"
                size="lg"
                className="rounded-xl"
                onClick={() => void startQuizWithIds(missedQuestions.map((question) => question.id))}
              >
                {t.quiz.redoErrors} ({missedQuestions.length})
              </Button>
            ) : null}
            <Link
              href="/browse"
              className="btn-raised inline-flex items-center rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] px-7 py-3.5 text-base font-semibold text-[color:var(--text-strong)] transition hover:bg-[color:var(--surface-muted)]"
            >
              {t.quiz.exploreBase}
            </Link>
          </div>
        </section>

        {/* Category breakdown + missed questions */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-[0_20px_60px_rgba(22,26,32,0.08)]">
            <h2 className="font-display text-lg font-bold text-[color:var(--text-strong)]">
              {t.quiz.byCategory}
            </h2>
            <div className="mt-5 space-y-4">
              {breakdown.map((item) => {
                const ratio = Math.round((item.correct / item.total) * 100);

                return (
                  <div key={item.category}>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="font-semibold text-[color:var(--text-strong)]">{item.category}</span>
                      <span className="font-medium tabular-nums text-[color:var(--text-soft)]">
                        {item.correct}/{item.total}
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[color:var(--surface-muted)]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--success))] progress-bar-fill"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 shadow-[0_20px_60px_rgba(22,26,32,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-lg font-bold text-[color:var(--text-strong)]">
                {t.quiz.missedQuestions}
              </h2>
              <span className="rounded-full bg-[color:var(--danger-soft)] px-3 py-1 text-xs font-bold text-[color:var(--danger)]">
                {missedQuestions.length}
              </span>
            </div>

            {missedQuestions.length ? (
              <div className="mt-5 space-y-3">
                {missedQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="rounded-xl border-2 border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4 transition hover:border-[color:var(--accent)]"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[color:var(--text-soft)]">
                      {question.term}
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-[color:var(--text-strong)]">{question.prompt}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <Link
                        href={`/question/${question.id}`}
                        className="text-sm font-bold text-[color:var(--accent-strong)] hover:underline"
                      >
                        {t.quiz.reviewQuestion}
                      </Link>
                      <ReviewToggleButton questionId={question.id} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border-2 border-[color:var(--success-border)] bg-[color:var(--success-soft)] p-5 text-center">
                <p className="text-2xl mb-2">V</p>
                <p className="text-sm font-bold text-[color:var(--success)]">
                  {t.quiz.perfectScore}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  /* ─── Screen Router ─── */

  if (screen === "loading") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4">
        <div className="rounded-2xl border-2 border-[color:var(--border)] bg-[color:var(--surface-strong)] px-10 py-12 text-center shadow-[0_20px_60px_rgba(22,26,32,0.08)] animate-fade-in">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-[color:var(--accent)] border-t-transparent animate-spin-slow" />
          <h1 className="font-display text-2xl font-bold text-[color:var(--text-strong)]">
            {t.quiz.preparingQuiz}
          </h1>
          <p className="mt-2 text-sm text-[color:var(--text-soft)]">{t.quiz.selectingQuestions}</p>
        </div>
      </div>
    );
  }

  if (screen === "playing") {
    return renderPlaying();
  }

  if (screen === "summary") {
    return renderSummary();
  }

  return renderSetup();
}
