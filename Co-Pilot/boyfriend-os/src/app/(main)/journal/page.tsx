import Link from "next/link";
import { getJournalEntries } from "@/features/journal/actions";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";

type JournalEntry = Awaited<ReturnType<typeof getJournalEntries>>[number];

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

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("es", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

export default async function JournalPage() {
  const entries = await getJournalEntries();

  return (
    <div className="space-y-6 px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Diario</h1>
          <p className="text-sm text-muted-foreground">
            Registra lo que pasa y como te sientes
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-base font-medium">No hay entradas aun</p>
            <p className="text-sm mt-1">
              Empieza a registrar tus momentos y emociones
            </p>
            <Button asChild className="mt-4">
              <Link href="/journal/new">
                <Plus className="h-4 w-4" />
                Nueva entrada
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry: JournalEntry) => (
            <Link key={entry.id} href={`/journal/${entry.id}`}>
              <Card className="py-4 hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0" role="img" aria-hidden="true">
                      {moodEmojis[entry.mood] ?? "\uD83D\uDE0A"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {formatDate(entry.happenedAt)}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {moodLabels[entry.mood] ?? entry.mood}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1 leading-relaxed">
                        {truncate(entry.what, 120)}
                      </p>
                    </div>
                  </div>

                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pl-11">
                      {entry.tags.map((tag: string, i: number) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-[10px] font-normal"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <Link
        href="/journal/new"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all active:scale-95"
        aria-label="Nueva entrada de diario"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
