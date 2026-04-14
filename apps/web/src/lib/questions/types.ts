export type QuestionFormat = "mcq" | "true_false" | "free_text";
export type Difficulty = "junior" | "mid" | "senior";

export interface QuestionResource {
  id: string;
  title: string;
  url: string;
  authority: string;
  domain: string;
}

export interface QuestionCodeSnippet {
  language: string | null;
  code: string;
}

export interface LabeledCodeSnippet {
  label: string;
  language: string;
  code: string;
}

interface QuestionBase {
  id: string;
  slug: string;
  term: string;
  prompt: string;
  sourceSection: string;
  category: string;
  categoryLabel: string;
  difficulty: Difficulty;
  difficultyLabel: string;
  priority: number;
  isRecentTopic: boolean;
  expectedAnswerPoints: string[];
  referenceAnswerMd: string;
  commonMistakes: string[];
  codeSnippet: QuestionCodeSnippet;
  codeSnippets: LabeledCodeSnippet[];
  keyPoints: string[];
  interviewReflex: string;
  relatedTerms: string[];
  resources: QuestionResource[];
  formatLabel: string;
  searchText: string;
}

export interface McqOption {
  text: string;
  isCorrect: boolean;
}

export interface McqQuestion extends QuestionBase {
  questionFormat: "mcq";
  options: McqOption[];
  correctOptionIndexes: number[];
  allowsMultipleAnswers: boolean;
}

export interface TrueFalseQuestion extends QuestionBase {
  questionFormat: "true_false";
  correctBoolean: boolean;
  booleanExplanation: string;
}

export interface FreeTextQuestion extends QuestionBase {
  questionFormat: "free_text";
}

export type QuizQuestion = McqQuestion | TrueFalseQuestion | FreeTextQuestion;

export interface QuestionMeta {
  totalQuestions: number;
  categoryCount: number;
  categories: Array<{ value: string; label: string; count: number }>;
  difficultyDistribution: Record<Difficulty, number>;
}

export interface BrowseParams {
  query?: string;
  category?: string;
  difficulty?: Difficulty | "all";
  page?: number;
  pageSize?: number;
}

export interface BrowseResult {
  items: QuizQuestion[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface QuizFilters {
  questionCount: number;
  category?: string;
  difficulty?: Difficulty | "all";
}
