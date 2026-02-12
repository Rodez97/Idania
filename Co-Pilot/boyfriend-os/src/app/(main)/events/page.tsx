import Link from "next/link";
import { getEvents } from "@/features/events/actions";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Plus } from "lucide-react";

type EventItem = Awaited<ReturnType<typeof getEvents>>[number];

const categoryColors: Record<string, string> = {
  date: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  anniversary: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  trip: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  general: "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300",
  check_in: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
};

function formatDate(dateTime: Date | string): string {
  const date = new Date(dateTime);
  return date.toLocaleDateString("es", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateTime: Date | string): string {
  const date = new Date(dateTime);
  return date.toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="space-y-6 px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Eventos</h1>
          <p className="text-sm text-muted-foreground">
            Momentos importantes juntos
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-base font-medium">No hay eventos aun</p>
            <p className="text-sm mt-1">
              Crea tu primer evento para no olvidar lo que importa
            </p>
            <Button asChild className="mt-4">
              <Link href="/events/new">
                <Plus className="h-4 w-4" />
                Crear evento
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event: EventItem) => (
            <Link key={event.id} href={`/events/${event.id}/edit`}>
              <Card className="py-4 hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold truncate">
                      {event.title}
                    </h3>
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
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(event.dateTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(event.dateTime)}
                    </span>
                  </div>
                  {event.notes && (
                    <p className="text-xs text-muted-foreground truncate">
                      {event.notes}
                    </p>
                  )}
                  {event.reminders.length > 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      {event.reminders.length} recordatorio(s)
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <Link
        href="/events/new"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all active:scale-95"
        aria-label="Crear nuevo evento"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
