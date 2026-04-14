import { NextResponse } from "next/server";
import { getQuestionsByIds, getRandomQuizQuestions } from "@/lib/questions/data";
import type { Difficulty } from "@/lib/questions/types";

function parseQuestionCount(value: string | null) {
  const parsed = Number.parseInt(value ?? "10", 10);

  if (Number.isNaN(parsed)) {
    return 10;
  }

  return Math.min(Math.max(parsed, 1), 30);
}

function parseDifficulty(value: string | null): Difficulty | "all" {
  if (value === "junior" || value === "mid" || value === "senior") {
    return value;
  }

  return "all";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const ids = url.searchParams
    .get("ids")
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (ids?.length) {
    const questions = await getQuestionsByIds(ids);
    return NextResponse.json({ questions });
  }

  const questionCount = parseQuestionCount(url.searchParams.get("questionCount"));
  const category = url.searchParams.get("category") ?? "all";
  const difficulty = parseDifficulty(url.searchParams.get("difficulty"));
  const questions = await getRandomQuizQuestions({
    questionCount,
    category,
    difficulty,
  });

  return NextResponse.json({ questions });
}
