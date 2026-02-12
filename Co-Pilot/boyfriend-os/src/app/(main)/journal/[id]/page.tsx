import Link from "next/link";
import { getJournalEntry } from "@/features/journal/actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Heart } from "lucide-react";

const moodEmojis: Record<string, string> = {
  ok: "\uD83D\uDE0A",
  distant: "\uD83D\uDE36",
  tense: "\uD83D\uDE30",
  great: "\uD83C\uDF1F",
};

const moodLabels: Record<string, string> = {
  ok: "Ok",
  distant: "Distante",
  tense: "Tenso",
  great: "Genial",
};

const moodColors: Record<string, string> = {
  ok: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  distant: "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300",
  tense: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  great: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("es", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface JournalDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JournalDetailPage({ params }: JournalDetailPageProps) {
  const { id } = await params;
  const entry = await getJournalEntry(id);

  return (
    <div className="space-y-6 px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/journal">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Entrada de Diario</h1>
          <p className="text-xs text-muted-foreground">
            Detalle completo
          </p>
        </div>
      </div>

      {/* Mood and Date Card */}
      <Card className="py-4">
        <CardContent className="flex items-center gap-4">
          <span className="text-4xl" role="img" aria-hidden="true">
            {moodEmojis[entry.mood] ?? "\uD83D\uDE0A"}
          </span>
          <div className="space-y-1">
            <Badge
              variant="secondary"
              className={moodColors[entry.mood] ?? moodColors.ok}
            >
              {moodLabels[entry.mood] ?? entry.mood}
            </Badge>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(entry.happenedAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* What happened */}
      <Card className="py-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Que paso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {entry.what}
          </p>
        </CardContent>
      </Card>

      {/* Feelings */}
      {entry.feelings && (
        <Card className="py-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5" />
              Sentimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {entry.feelings}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Outcome */}
      {entry.outcome && (
        <Card className="py-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resultado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {entry.outcome}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Etiquetas
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {entry.tags.map((tag: string, i: number) => (
              <Badge key={i} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
