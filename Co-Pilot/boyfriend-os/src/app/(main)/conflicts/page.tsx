import Link from "next/link";
import { getConflicts } from "@/features/conflicts/actions";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type ConflictItem = Awaited<ReturnType<typeof getConflicts>>[number];

const goalLabels: Record<string, string> = {
  repair: "Reparar",
  clarify: "Aclarar",
  boundary: "Limite",
};

const goalColors: Record<string, string> = {
  repair: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  clarify: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  boundary: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("es", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function IntensityBar({ intensity }: { intensity: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-1.5 rounded-sm transition-colors",
              i < intensity
                ? intensity <= 3
                  ? "bg-green-500"
                  : intensity <= 6
                    ? "bg-yellow-500"
                    : "bg-red-500"
                : "bg-muted",
            )}
          />
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground font-medium">
        {intensity}/10
      </span>
    </div>
  );
}

export default async function ConflictsPage() {
  const conflicts = await getConflicts();

  return (
    <div className="space-y-6 px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conflictos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona situaciones dificiles con empatia
          </p>
        </div>
      </div>

      {conflicts.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center text-muted-foreground">
            <ShieldAlert className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-base font-medium">No hay conflictos registrados</p>
            <p className="text-sm mt-1">
              Cuando surja una situacion dificil, este espacio te ayudara
            </p>
            <Button asChild className="mt-4">
              <Link href="/conflicts/new">
                <Plus className="h-4 w-4" />
                Nuevo conflicto
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {conflicts.map((conflict: ConflictItem) => (
            <Card key={conflict.id} className="py-4">
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold">
                    {conflict.topic}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={goalColors[conflict.goal] ?? goalColors.repair}
                  >
                    {goalLabels[conflict.goal] ?? conflict.goal}
                  </Badge>
                </div>

                <IntensityBar intensity={conflict.intensity} />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(conflict.createdAt)}
                  </span>
                  {conflict.resolutionNotes && (
                    <Badge variant="outline" className="text-[10px] text-green-600 border-green-300">
                      Resuelto
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <Link
        href="/conflicts/new"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all active:scale-95"
        aria-label="Nuevo conflicto"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
