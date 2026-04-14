import { cache } from "react";
import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  BrowseParams,
  BrowseResult,
  Difficulty,
  LabeledCodeSnippet,
  McqQuestion,
  QuestionCodeSnippet,
  QuestionFormat,
  QuestionMeta,
  QuestionResource,
  QuizFilters,
  QuizQuestion,
  TrueFalseQuestion,
} from "./types";

interface RawResource {
  id: string;
  title: string;
  url: string;
  authority: string;
  domain: string;
}

interface RawRelatedResource {
  id: string;
  label: string;
  url: string;
  authority: string;
  domain: string;
}

interface RawCodeSnippetItem {
  label: string;
  language: string;
  code: string;
}

interface RawQuestionBase {
  id: string;
  source_section: string;
  domain: string;
  term: string;
  slug: string;
  question_format: QuestionFormat;
  difficulty: Difficulty;
  priority: number;
  is_recent_topic: boolean;
  prompt: string;
  expected_answer_points: string[];
  reference_answer_md: string;
  common_mistakes: string[];
  code_snippet: string | { language: string; code: string };
  code_snippets: RawCodeSnippetItem[];
  key_points: string[];
  interview_reflex: string;
  related_terms: string[];
  resource_ids: string[];
  related_resources: RawRelatedResource[];
  source_lists: string[];
  answer_style: string;
  allows_multiple_answers: boolean;
}

interface RawMcqQuestion extends RawQuestionBase {
  question_format: "mcq";
  options: Array<{ text: string; is_correct: boolean }>;
  correct_option_indexes: number[];
}

interface RawTrueFalseQuestion extends RawQuestionBase {
  question_format: "true_false";
  correct_boolean: boolean;
  boolean_explanation: string;
}

type RawQuestion = RawMcqQuestion | RawTrueFalseQuestion;

interface RawDataset {
  resource_catalog: RawResource[];
  questions: RawQuestion[];
}

const DATASET_PATH = path.resolve(
  process.cwd(),
  "../server/prisma/seed-data/fullstack_ts_interview_question_bank_2026_enriched_v4.json",
);

function toLabel(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatLabel(format: QuestionFormat) {
  if (format === "mcq") {
    return "QCM";
  }

  return "Vrai / Faux";
}

function difficultyLabel(difficulty: Difficulty) {
  if (difficulty === "mid") {
    return "Mid";
  }

  return toLabel(difficulty);
}

function normalizeCodeSnippet(raw: string | { language: string; code: string }): QuestionCodeSnippet {
  if (typeof raw === "string") {
    return { language: null, code: raw };
  }

  return { language: raw.language, code: raw.code };
}

function normalizeRelatedResources(raw: RawRelatedResource[]): QuestionResource[] {
  return raw.map((resource) => ({
    id: resource.id,
    title: resource.label,
    url: resource.url,
    authority: resource.authority,
    domain: resource.domain,
  }));
}

function normalizeCodeSnippets(raw: RawCodeSnippetItem[]): LabeledCodeSnippet[] {
  return raw.map((snippet) => ({
    label: snippet.label,
    language: snippet.language,
    code: snippet.code,
  }));
}

function normalizeQuestion(raw: RawQuestion, resourcesById: Map<string, QuestionResource>): QuizQuestion {
  const codeSnippets = normalizeCodeSnippets(raw.code_snippets ?? []);
  const resources = raw.related_resources?.length
    ? normalizeRelatedResources(raw.related_resources)
    : raw.resource_ids
        .map((resourceId) => resourcesById.get(resourceId))
        .filter((resource): resource is QuestionResource => Boolean(resource));

  const shared = {
    id: raw.id,
    slug: raw.slug,
    term: raw.term,
    prompt: raw.prompt,
    sourceSection: raw.source_section,
    category: raw.domain,
    categoryLabel: toLabel(raw.domain),
    difficulty: raw.difficulty,
    difficultyLabel: difficultyLabel(raw.difficulty),
    priority: raw.priority,
    isRecentTopic: raw.is_recent_topic,
    expectedAnswerPoints: raw.expected_answer_points,
    referenceAnswerMd: raw.reference_answer_md,
    commonMistakes: raw.common_mistakes,
    codeSnippet: codeSnippets.length
      ? { language: codeSnippets[0].language, code: codeSnippets[0].code }
      : normalizeCodeSnippet(raw.code_snippet),
    codeSnippets,
    keyPoints: raw.key_points ?? [],
    interviewReflex: raw.interview_reflex ?? "",
    relatedTerms: raw.related_terms,
    resources,
    formatLabel: formatLabel(raw.question_format),
    searchText: [
      raw.term,
      raw.prompt,
      raw.domain,
      raw.source_section,
      raw.related_terms.join(" "),
      raw.expected_answer_points.join(" "),
      (raw.key_points ?? []).join(" "),
    ]
      .join(" ")
      .toLowerCase(),
  };

  if (raw.question_format === "mcq") {
    return {
      ...shared,
      questionFormat: "mcq",
      options: raw.options.map((option) => ({
        text: option.text,
        isCorrect: option.is_correct,
      })),
      correctOptionIndexes: raw.correct_option_indexes,
      allowsMultipleAnswers: raw.allows_multiple_answers,
    } satisfies McqQuestion;
  }

  return {
    ...shared,
    questionFormat: "true_false",
    correctBoolean: raw.correct_boolean,
    booleanExplanation: raw.boolean_explanation,
  } satisfies TrueFalseQuestion;
}

function shuffle<T>(items: T[]) {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }

  return next;
}

function filterQuestions(questions: QuizQuestion[], filters: Partial<QuizFilters & BrowseParams>) {
  const query = filters.query?.trim().toLowerCase();

  return questions.filter((question) => {
    if (filters.category && filters.category !== "all" && question.category !== filters.category) {
      return false;
    }

    if (filters.difficulty && filters.difficulty !== "all" && question.difficulty !== filters.difficulty) {
      return false;
    }

    if (query && !question.searchText.includes(query)) {
      return false;
    }

    return true;
  });
}

const loadDataset = cache(async () => {
  const rawContent = await fs.readFile(DATASET_PATH, "utf8");
  const dataset = JSON.parse(rawContent) as RawDataset;
  const resourcesById = new Map<string, QuestionResource>(
    dataset.resource_catalog.map((resource) => [
      resource.id,
      {
        id: resource.id,
        title: resource.title,
        url: resource.url,
        authority: resource.authority,
        domain: resource.domain,
      },
    ]),
  );

  const questions = dataset.questions.map((question) => normalizeQuestion(question, resourcesById));

  const categoryCountMap = new Map<string, { value: string; label: string; count: number }>();
  const difficultyDistribution: QuestionMeta["difficultyDistribution"] = {
    junior: 0,
    mid: 0,
    senior: 0,
  };
  for (const question of questions) {
    const existingCategory = categoryCountMap.get(question.category);

    if (existingCategory) {
      existingCategory.count += 1;
    } else {
      categoryCountMap.set(question.category, {
        value: question.category,
        label: question.categoryLabel,
        count: 1,
      });
    }

    difficultyDistribution[question.difficulty] += 1;
  }

  const meta: QuestionMeta = {
    totalQuestions: questions.length,
    categoryCount: categoryCountMap.size,
    categories: [...categoryCountMap.values()].sort((left, right) => right.count - left.count),
    difficultyDistribution,
  };

  return {
    questions,
    meta,
  };
});

export async function getQuestionMeta() {
  const dataset = await loadDataset();
  return dataset.meta;
}

export async function getQuestionById(id: string) {
  const dataset = await loadDataset();
  return dataset.questions.find((question) => question.id === id) ?? null;
}

export async function getQuestionBySlug(slug: string) {
  const dataset = await loadDataset();
  return dataset.questions.find((question) => question.slug === slug) ?? null;
}

export async function getQuestionsByIds(ids: string[]) {
  const dataset = await loadDataset();
  const questionMap = new Map(dataset.questions.map((question) => [question.id, question]));

  return ids
    .map((id) => questionMap.get(id))
    .filter((question): question is QuizQuestion => Boolean(question));
}

export async function getBrowseQuestions(params: BrowseParams = {}): Promise<BrowseResult> {
  const dataset = await loadDataset();
  const pageSize = Math.min(Math.max(params.pageSize ?? 18, 1), 48);
  const page = Math.max(params.page ?? 1, 1);
  const filtered = filterQuestions(dataset.questions, params);
  const totalItems = filtered.length;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    items,
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
}

export async function getRandomQuizQuestions(filters: QuizFilters) {
  const dataset = await loadDataset();
  const filtered = filterQuestions(dataset.questions, filters);
  const safeCount = Math.min(Math.max(filters.questionCount, 1), 30);

  return shuffle(filtered).slice(0, Math.min(safeCount, filtered.length));
}
