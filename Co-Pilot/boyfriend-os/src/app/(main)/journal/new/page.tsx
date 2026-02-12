"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type MoodValue = "ok" | "distant" | "tense" | "great";

const moods: { value: MoodValue; emoji: string; label: string }[] = [
  { value: "ok", emoji: "\uD83D\uDE0A", label: "Ok" },
  { value: "distant", emoji: "\uD83D\uDE36", label: "Distante" },
  { value: "tense", emoji: "\uD83D\uDE30", label: "Tenso" },
  { value: "great", emoji: "\uD83C\uDF1F", label: "Genial" },
];

export default function NewJournalEntryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOptional, setShowOptional] = useState(false);

  const [what, setWhat] = useState("");
  const [mood, setMood] = useState<MoodValue>("ok");
  const [feelings, setFeelings] = useState("");
  const [outcome, setOutcome] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  function handleTagsKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagsInput.trim().replace(/,/g, "");
      if (tag && !tags.includes(tag)) {
        setTags((prev) => [...prev, tag]);
      }
      setTagsInput("");
    }
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Combine any remaining tags input
    const finalTags = [...tags];
    const remainingTag = tagsInput.trim().replace(/,/g, "");
    if (remainingTag && !finalTags.includes(remainingTag)) {
      finalTags.push(remainingTag);
    }

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          what,
          mood,
          feelings: feelings || undefined,
          outcome: outcome || undefined,
          tags: finalTags,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear entrada");
      }

      router.push("/journal");
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
          <Link href="/journal">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Nueva Entrada</h1>
          <p className="text-xs text-muted-foreground">
            Captura rapida de lo que paso
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

        {/* What happened - main field */}
        <div className="space-y-2">
          <Label htmlFor="what">Que paso?</Label>
          <Textarea
            id="what"
            placeholder="Describe lo que paso..."
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            rows={5}
            required
            className="text-base"
            autoFocus
          />
        </div>

        {/* Mood Selection */}
        <div className="space-y-2">
          <Label>Como te sentiste?</Label>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {moods.map((m) => (
              <Button
                key={m.value}
                type="button"
                variant={mood === m.value ? "default" : "outline"}
                size="sm"
                onClick={() => setMood(m.value)}
                className={cn(
                  "shrink-0 gap-1.5 rounded-full px-4 transition-all",
                  mood === m.value && "ring-2 ring-primary/30 scale-105",
                )}
              >
                <span className="text-base" role="img" aria-hidden="true">
                  {m.emoji}
                </span>
                <span className="text-xs">{m.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Etiquetas</Label>
          <div className="space-y-2">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="rounded-full p-0.5 hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <Input
              id="tags"
              placeholder="Escribe y presiona Enter..."
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onKeyDown={handleTagsKeyDown}
            />
          </div>
        </div>

        {/* Optional Fields Toggle */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowOptional(!showOptional)}
          className="w-full gap-2 text-muted-foreground"
        >
          {showOptional ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Ocultar campos opcionales
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Mostrar campos opcionales
            </>
          )}
        </Button>

        {showOptional && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Feelings */}
            <div className="space-y-2">
              <Label htmlFor="feelings">Sentimientos</Label>
              <Textarea
                id="feelings"
                placeholder="Que emociones experimentaste?"
                value={feelings}
                onChange={(e) => setFeelings(e.target.value)}
                rows={3}
              />
            </div>

            {/* Outcome */}
            <div className="space-y-2">
              <Label htmlFor="outcome">Resultado</Label>
              <Textarea
                id="outcome"
                placeholder="Como termino la situacion?"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !what.trim()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar Entrada"
          )}
        </Button>
      </form>
    </div>
  );
}
