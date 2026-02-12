"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MoodValue = "ok" | "distant" | "tense" | "great";

const moods: { value: MoodValue; emoji: string; label: string }[] = [
  { value: "ok", emoji: "\uD83D\uDE0A", label: "Ok" },
  { value: "distant", emoji: "\uD83D\uDE36", label: "Distante" },
  { value: "tense", emoji: "\uD83D\uDE30", label: "Tenso" },
  { value: "great", emoji: "\uD83C\uDF1F", label: "Genial" },
];

interface MoodSelectorProps {
  currentMood: MoodValue | null;
}

export function MoodSelector({ currentMood }: MoodSelectorProps) {
  const [selected, setSelected] = useState<MoodValue | null>(currentMood);
  const [isPending, startTransition] = useTransition();

  function handleSelect(mood: MoodValue) {
    setSelected(mood);
    startTransition(async () => {
      try {
        const res = await fetch("/api/mood", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mood }),
        });
        if (!res.ok) {
          setSelected(currentMood);
        }
      } catch {
        setSelected(currentMood);
      }
    });
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
      {moods.map((m) => {
        const isSelected = selected === m.value;
        return (
          <Button
            key={m.value}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            disabled={isPending}
            onClick={() => handleSelect(m.value)}
            className={cn(
              "shrink-0 gap-1.5 rounded-full px-4 transition-all",
              isSelected && "ring-2 ring-primary/30 scale-105",
            )}
          >
            <span className="text-base" role="img" aria-hidden="true">
              {m.emoji}
            </span>
            <span className="text-xs">{m.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
