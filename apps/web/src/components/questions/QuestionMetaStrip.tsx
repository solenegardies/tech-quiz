import { Badge } from "@/components/ui/Badge";
import { getDictionary } from "@/lib/i18n";
import type { QuizQuestion } from "@/lib/questions/types";

export function QuestionMetaStrip({ question }: { question: QuizQuestion }) {
  const t = getDictionary();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="default">
        {question.difficultyLabel}
      </Badge>
      <Badge variant="default">{question.categoryLabel}</Badge>
      {question.isRecentTopic ? (
        <Badge variant="warning" icon="!">
          {t.questionDetail.hotTopic}
        </Badge>
      ) : null}
    </div>
  );
}
