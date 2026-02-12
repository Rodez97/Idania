"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraftCardProps {
  tone: "warm" | "direct" | "light";
  text: string;
  riskFlags: string[];
  onUse?: () => void;
}

const toneConfig: Record<
  string,
  { label: string; badgeClass: string }
> = {
  warm: {
    label: "Calido",
    badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  },
  direct: {
    label: "Directo",
    badgeClass: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  },
  light: {
    label: "Ligero",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
};

export function DraftCard({ tone, text, riskFlags, onUse }: DraftCardProps) {
  const [copied, setCopied] = useState(false);
  const config = toneConfig[tone];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Card className="py-4">
      <CardContent className="space-y-3">
        <Badge
          variant="secondary"
          className={cn("text-xs", config.badgeClass)}
        >
          {config.label}
        </Badge>

        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {text}
        </p>

        {riskFlags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {riskFlags.map((flag, i) => (
              <Badge
                key={i}
                variant="outline"
                className="bg-orange-50 text-orange-700 border-orange-200 text-[10px] dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700"
              >
                {flag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-1.5"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copiar
            </>
          )}
        </Button>
        {onUse && (
          <Button size="sm" onClick={onUse} className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            Usar esta
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
