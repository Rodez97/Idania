"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DraftCard } from "@/components/draft-card";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageCircle,
  Lightbulb,
  ShieldAlert,
} from "lucide-react";
import type { AssistantResponse } from "@/lib/assistant/types";

export default function AssistantPage() {
  const [context, setContext] = useState("");
  const [intent, setIntent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [showNvc, setShowNvc] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, intent }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al generar borradores");
      }

      const data: AssistantResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsLoading(false);
    }
  }

  // Collect all unique risk flags from all drafts
  const allRiskFlags = response
    ? [...new Set(response.drafts.flatMap((d) => d.riskFlags))]
    : [];

  // Get the bridge question from the first draft
  const bridgeQuestion = response?.drafts[0]?.bridgeQuestion;

  // Get NVC version from the first draft
  const nvcVersion = response?.drafts[0]?.nvcVersion;

  return (
    <div className="space-y-6 px-4 py-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          Asistente
        </h1>
        <p className="text-sm text-muted-foreground">
          Te ayudo a comunicar lo que sientes con claridad
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleGenerate} className="space-y-4">
        {error && (
          <Card className="border-destructive bg-destructive/5 py-3">
            <CardContent>
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          <Label htmlFor="context">Pega el contexto de la conversacion</Label>
          <Textarea
            id="context"
            placeholder="Copia y pega la conversacion o describe la situacion..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={6}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="intent">Que quieres comunicar?</Label>
          <Input
            id="intent"
            placeholder="Ej: Quiero decirle que me senti ignorado..."
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !context.trim() || !intent.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generando borradores...
            </>
          ) : (
            "Generar 3 Borradores"
          )}
        </Button>
      </form>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="py-4 animate-pulse">
              <CardContent className="space-y-3">
                <div className="h-5 w-16 bg-muted rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-4/5" />
                  <div className="h-4 bg-muted rounded w-3/5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results */}
      {response && !isLoading && (
        <div className="space-y-5">
          {/* Risk Flags */}
          {allRiskFlags.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20 py-4">
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-300">
                  <ShieldAlert className="h-4 w-4" />
                  Banderas de riesgo
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allRiskFlags.map((flag, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700"
                    >
                      {flag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Draft Cards */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Borradores
            </h2>
            {response.drafts.map((draft, i) => (
              <DraftCard
                key={i}
                tone={draft.tone}
                text={draft.text}
                riskFlags={draft.riskFlags}
                onUse={() => {
                  navigator.clipboard.writeText(draft.text);
                }}
              />
            ))}
          </section>

          {/* Bridge Question */}
          {bridgeQuestion && (
            <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20 py-4">
              <CardContent className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
                  <Lightbulb className="h-4 w-4" />
                  Pregunta puente
                </div>
                <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                  {bridgeQuestion}
                </p>
              </CardContent>
            </Card>
          )}

          {/* NVC Version (Expandable) */}
          {nvcVersion && (
            <Card className="py-4">
              <CardContent className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowNvc(!showNvc)}
                  className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>Version CNV (Comunicacion No Violenta)</span>
                  {showNvc ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {showNvc && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap animate-in slide-in-from-top-2 duration-200 pt-2 border-t">
                    {nvcVersion}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Principles Note */}
          {response.principles && (
            <Card className="bg-muted/30 py-4">
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  {response.principles}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
