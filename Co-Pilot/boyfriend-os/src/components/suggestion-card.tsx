import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SuggestionItem } from "@/types";

const typeConfig: Record<
  SuggestionItem["type"],
  { label: string; borderColor: string; badgeClass: string }
> = {
  "micro-gesture": {
    label: "Micro-gesto",
    borderColor: "border-l-purple-500",
    badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  },
  "small-plan": {
    label: "Plan sencillo",
    borderColor: "border-l-blue-500",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  "pro-plan": {
    label: "Plan pro",
    borderColor: "border-l-amber-500",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  "bridge-question": {
    label: "Pregunta puente",
    borderColor: "border-l-green-500",
    badgeClass: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
};

interface SuggestionCardProps {
  suggestion: SuggestionItem;
}

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const config = typeConfig[suggestion.type];

  return (
    <Card
      className={cn(
        "border-l-4 py-4",
        config.borderColor,
      )}
    >
      <CardContent className="flex items-start gap-3">
        <span className="text-2xl shrink-0" role="img" aria-hidden="true">
          {suggestion.emoji}
        </span>
        <div className="flex flex-col gap-1.5 min-w-0">
          <Badge
            variant="secondary"
            className={cn("text-[10px] uppercase tracking-wide", config.badgeClass)}
          >
            {config.label}
          </Badge>
          <p className="text-sm text-foreground leading-relaxed">
            {suggestion.text}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
