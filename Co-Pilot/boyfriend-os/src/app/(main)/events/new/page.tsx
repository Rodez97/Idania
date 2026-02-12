"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Bell,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface ReminderItem {
  offsetMinutes: number;
  channel: "inApp" | "push";
}

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "date", label: "Cita" },
  { value: "anniversary", label: "Aniversario" },
  { value: "trip", label: "Viaje" },
  { value: "check_in", label: "Check-in" },
];

const REMINDER_OPTIONS = [
  { value: 5, label: "5 minutos antes" },
  { value: 15, label: "15 minutos antes" },
  { value: 30, label: "30 minutos antes" },
  { value: 60, label: "1 hora antes" },
  { value: 120, label: "2 horas antes" },
  { value: 1440, label: "1 dia antes" },
  { value: 10080, label: "1 semana antes" },
];

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [category, setCategory] = useState("general");
  const [notes, setNotes] = useState("");
  const [reminders, setReminders] = useState<ReminderItem[]>([]);

  function addReminder() {
    setReminders((prev) => [
      ...prev,
      { offsetMinutes: 30, channel: "inApp" },
    ]);
  }

  function removeReminder(index: number) {
    setReminders((prev) => prev.filter((_, i) => i !== index));
  }

  function updateReminderOffset(index: number, value: number) {
    setReminders((prev) =>
      prev.map((r, i) => (i === index ? { ...r, offsetMinutes: value } : r)),
    );
  }

  function updateReminderChannel(index: number, value: "inApp" | "push") {
    setReminders((prev) =>
      prev.map((r, i) => (i === index ? { ...r, channel: value } : r)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          dateTime,
          category,
          notes: notes || undefined,
          reminders,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear evento");
      }

      router.push("/events");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/events">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Nuevo Evento</h1>
          <p className="text-xs text-muted-foreground">
            Registra un momento importante
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <Card className="border-destructive bg-destructive/5 py-3">
            <CardContent>
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Titulo</Label>
          <Input
            id="title"
            placeholder="Cena romantica, Aniversario..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Date & Time */}
        <div className="space-y-2">
          <Label htmlFor="dateTime">Fecha y hora</Label>
          <Input
            id="dateTime"
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona categoria" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notas (opcional)</Label>
          <Textarea
            id="notes"
            placeholder="Detalles del evento..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Reminders */}
        <Card className="py-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Bell className="h-4 w-4" />
              Recordatorios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reminders.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                Sin recordatorios
              </p>
            )}

            {reminders.map((reminder, index) => (
              <div key={index} className="flex items-center gap-2">
                <Select
                  value={String(reminder.offsetMinutes)}
                  onValueChange={(v) =>
                    updateReminderOffset(index, Number(v))
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REMINDER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={reminder.channel}
                  onValueChange={(v) =>
                    updateReminderChannel(index, v as "inApp" | "push")
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inApp">In-App</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeReminder(index)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addReminder}
              className="w-full gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar recordatorio
            </Button>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !title || !dateTime}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            "Crear Evento"
          )}
        </Button>
      </form>
    </div>
  );
}
