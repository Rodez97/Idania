"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Zap,
  Leaf,
  Shield,
  Loader2,
  Check,
  X,
  User,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProfileData {
  displayName: string;
  loveLanguages: string[];
  triggers: string[];
  calmers: string[];
  boundaries: string[];
  preferences: Record<string, unknown>;
}

interface ProfileFormProps {
  initialProfile: ProfileData | null;
}

const LOVE_LANGUAGE_OPTIONS = [
  "Palabras de afirmacion",
  "Tiempo de calidad",
  "Regalos",
  "Actos de servicio",
  "Contacto fisico",
];

function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder,
}: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = input.trim().replace(/,/g, "");
      if (tag && !tags.includes(tag)) {
        onAdd(tag);
      }
      setInput("");
    }
  }

  return (
    <div className="space-y-2">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="rounded-full p-0.5 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Input
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [displayName, setDisplayName] = useState(
    initialProfile?.displayName ?? "",
  );
  const [loveLanguages, setLoveLanguages] = useState<string[]>(
    initialProfile?.loveLanguages ?? [],
  );
  const [triggers, setTriggers] = useState<string[]>(
    initialProfile?.triggers ?? [],
  );
  const [calmers, setCalmers] = useState<string[]>(
    initialProfile?.calmers ?? [],
  );
  const [boundaries, setBoundaries] = useState<string[]>(
    initialProfile?.boundaries ?? [],
  );

  function toggleLoveLanguage(lang: string) {
    setLoveLanguages((prev) =>
      prev.includes(lang)
        ? prev.filter((l) => l !== lang)
        : [...prev, lang],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          loveLanguages,
          triggers,
          calmers,
          boundaries,
          preferences: {},
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar perfil");
      }

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <User className="h-6 w-6" />
            Perfil de Pareja
          </h1>
          <p className="text-sm text-muted-foreground">
            Conocerla mejor para amarla mejor
          </p>
        </div>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <Settings className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <Card className="border-destructive bg-destructive/5 py-3">
            <CardContent>
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {saved && (
          <Card className="border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20 py-3">
            <CardContent className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <Check className="h-4 w-4" />
              Perfil guardado exitosamente
            </CardContent>
          </Card>
        )}

        {/* Display Name */}
        <Card className="py-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Nombre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Como se llama tu pareja?"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </CardContent>
        </Card>

        {/* Love Languages */}
        <Card className="py-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              Lenguajes del amor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {LOVE_LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLoveLanguage(lang)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                    loveLanguages.includes(lang)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-muted-foreground/50",
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Triggers */}
        <Card className="py-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              Triggers (lo que la molesta)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TagInput
              tags={triggers}
              onAdd={(tag) => setTriggers((prev) => [...prev, tag])}
              onRemove={(tag) =>
                setTriggers((prev) => prev.filter((t) => t !== tag))
              }
              placeholder="Escribe y presiona Enter..."
            />
          </CardContent>
        </Card>

        {/* Calmers */}
        <Card className="py-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-500" />
              Lo que la calma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TagInput
              tags={calmers}
              onAdd={(tag) => setCalmers((prev) => [...prev, tag])}
              onRemove={(tag) =>
                setCalmers((prev) => prev.filter((t) => t !== tag))
              }
              placeholder="Escribe y presiona Enter..."
            />
          </CardContent>
        </Card>

        {/* Boundaries */}
        <Card className="py-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              Limites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TagInput
              tags={boundaries}
              onAdd={(tag) => setBoundaries((prev) => [...prev, tag])}
              onRemove={(tag) =>
                setBoundaries((prev) => prev.filter((t) => t !== tag))
              }
              placeholder="Escribe y presiona Enter..."
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !displayName.trim()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar Perfil"
          )}
        </Button>
      </form>
    </div>
  );
}
