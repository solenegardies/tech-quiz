import { Badge } from "@/components/ui/Badge";
import type { QuizQuestion } from "@/lib/questions/types";

export function QuestionMetaStrip({ question }: { question: QuizQuestion }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="default">
        {question.difficultyLabel}
      </Badge>
      <Badge variant="default">{question.categoryLabel}</Badge>
    </div>
  );
}
