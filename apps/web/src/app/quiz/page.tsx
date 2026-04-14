import { SiteHeader } from "@/components/layout/SiteHeader";
import { QuizPageClient } from "@/components/quiz/QuizPageClient";
import { getQuestionMeta } from "@/lib/questions/data";

export default async function QuizPage({
  searchParams,
}: {
  searchParams?: Promise<{ resume?: string }>;
}) {
  const meta = await getQuestionMeta();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <QuizPageClient meta={meta} resumeRequested={resolvedSearchParams?.resume === "1"} />
    </div>
  );
}
