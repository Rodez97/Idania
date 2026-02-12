import { getTodayData } from "@/features/today/actions";
import { MoodSelector } from "@/components/mood-selector";
import { SuggestionCard } from "@/components/suggestion-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarHeart, Clock, Sparkles } from "lucide-react";

type TodayData = Awaited<ReturnType<typeof getTodayData>>;
type UpcomingEvent = TodayData["upcomingEvents"][number];

function getGreeting(): { message: string; sub: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { message: "Buenos dias", sub: "Empieza el dia con intencion" };
  }
  if (hour >= 12 && hour < 19) {
    return { message: "Buenas tardes", sub: "Como va tu dia?" };
  }
  return { message: "Buenas noches", sub: "Reflexiona sobre tu dia" };
}

function formatEventDate(dateTime: Date | string): string {
  const date = new Date(dateTime);
  return date.toLocaleDateString("es", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatEventTime(dateTime: Date | string): string {
  const date = new Date(dateTime);
  return date.toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const categoryColors: Record<string, string> = {
  date: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  anniversary: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  trip: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  general: "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300",
  check_in: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
};

export default async function TodayPage() {
  const { suggestions, upcomingEvents, currentMood } = await getTodayData();
  const { message, sub } = getGreeting();

  return (
    <div className="space-y-6 px-4 py-6 max-w-lg mx-auto">
      {/* Greeting Section */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{message}</h1>
        <p className="text-sm text-muted-foreground">{sub}</p>
      </div>

      {/* Mood Selector */}
      <Card className="py-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            Como te sientes hoy?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MoodSelector currentMood={currentMood} />
        </CardContent>
      </Card>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Sugerencias para hoy
          </h2>
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <SuggestionCard key={i} suggestion={s} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <CalendarHeart className="h-4 w-4" />
          Proximos 7 dias
        </h2>

        {upcomingEvents.length === 0 ? (
          <Card className="py-8">
            <CardContent className="text-center text-muted-foreground">
              <CalendarHeart className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No hay eventos proximos</p>
              <p className="text-xs mt-1">
                Crea uno desde la seccion de eventos
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((event: UpcomingEvent) => (
              <Card key={event.id} className="py-3">
                <CardContent className="flex items-center gap-3">
                  <div className="flex flex-col items-center shrink-0 w-12">
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">
                      {formatEventDate(event.dateTime).split(",")[0]}
                    </span>
                    <span className="text-lg font-bold leading-tight">
                      {new Date(event.dateTime).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatEventTime(event.dateTime)}
                      </span>
                      <Badge
                        variant="secondary"
                        className={
                          categoryColors[event.category] ??
                          categoryColors.general
                        }
                      >
                        {event.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
