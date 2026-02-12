"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ArrowRight,
  Check,
  Copy,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Goal = "repair" | "clarify" | "boundary";

const goalOptions: { value: Goal; label: string; description: string }[] = [
  { value: "repair", label: "Reparar", description: "Sanar algo que se rompio" },
  { value: "clarify", label: "Aclarar", description: "Resolver un malentendido" },
  { value: "boundary", label: "Limite", description: "Establecer un limite necesario" },
];

export default function NewConflictPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 fields
  const [topic, setTopic] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [goal, setGoal] = useState<Goal>("repair");

  // Step 2 - generated content (fetched from API)
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [nvcMessage, setNvcMessage] = useState("");
  const [nextSteps, setNextSteps] = useState<string[]>([]);
  const [conflictId, setConflictId] = useState<string | null>(null);

  // Step 3
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [copiedMessage, setCopiedMessage] = useState(false);

  async function handleStep1Submit() {
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/conflicts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, intensity, goal }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear conflicto");
      }

      const conflict = await res.json();
      setConflictId(conflict.id);
      setGeneratedMessage(conflict.generatedMessage || "");
      setNvcMessage(conflict.nvcMessage || "");
      setNextSteps(conflict.nextSteps || []);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleStep(index: number) {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  async function handleCopyMessage() {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    } catch {
      // Fallback
    }
  }

  function handleFinish() {
    router.push("/conflicts");
    router.refresh();
  }

  return (
    <div className="space-y-6 px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/conflicts">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Nuevo Conflicto
          </h1>
          <p className="text-xs text-muted-foreground">
            Paso {step} de 3
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              s <= step ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/5 py-3">
          <CardContent>
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Input */}
      {step === 1 && (
        <div className="space-y-5">
          <Card className="py-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Describe la situacion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Topic */}
              <div className="space-y-2">
                <Label htmlFor="topic">Tema del conflicto</Label>
                <Input
                  id="topic"
                  placeholder="Ej: No me aviso que llegaria tarde..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
              </div>

              {/* Intensity Slider */}
              <div className="space-y-3">
                <Label>
                  Intensidad:{" "}
                  <span className="font-bold text-base">{intensity}</span>/10
                </Label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full accent-primary h-2 rounded-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Leve</span>
                  <span>Moderado</span>
                  <span>Intenso</span>
                </div>
              </div>

              {/* Goal */}
              <div className="space-y-2">
                <Label>Objetivo</Label>
                <div className="grid gap-2">
                  {goalOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setGoal(opt.value)}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border p-3 text-left transition-all",
                        goal === opt.value
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border hover:border-muted-foreground/30",
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                          goal === opt.value
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/40",
                        )}
                      >
                        {goal === opt.value && (
                          <Check className="h-2.5 w-2.5 text-primary-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {opt.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleStep1Submit}
            className="w-full gap-2"
            disabled={isSubmitting || !topic.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando mensaje...
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Step 2: Generated Messages */}
      {step === 2 && (
        <div className="space-y-5">
          {/* Calm Message */}
          <Card className="py-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Mensaje calmado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/30 rounded-lg p-3">
                {generatedMessage}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyMessage}
                className="gap-1.5"
              >
                {copiedMessage ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copiar mensaje
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* NVC Version */}
          {nvcMessage && (
            <Card className="py-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Version CNV
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/30 rounded-lg p-3">
                  {nvcMessage}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Atras
            </Button>
            <Button
              onClick={() => setStep(3)}
              className="flex-1 gap-2"
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Next Steps */}
      {step === 3 && (
        <div className="space-y-5">
          <Card className="py-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Proximos pasos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {nextSteps.length > 0 ? (
                nextSteps.map((stepText, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleStep(i)}
                    className={cn(
                      "flex items-start gap-3 w-full rounded-lg border p-3 text-left transition-all",
                      checkedSteps.has(i)
                        ? "border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20"
                        : "border-border hover:bg-muted/30",
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 h-5 w-5 rounded shrink-0 border-2 flex items-center justify-center transition-colors",
                        checkedSteps.has(i)
                          ? "bg-green-500 border-green-500"
                          : "border-muted-foreground/40",
                      )}
                    >
                      {checkedSteps.has(i) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        checkedSteps.has(i) && "line-through text-muted-foreground",
                      )}
                    >
                      {stepText}
                    </p>
                  </button>
                ))
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Toma un momento para reflexionar sobre la situacion y define tus propios pasos.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="flex-1"
            >
              Atras
            </Button>
            <Button
              onClick={handleFinish}
              className="flex-1 gap-2"
            >
              <Check className="h-4 w-4" />
              Guardar y terminar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
