import type { Mood } from "@prisma/client";

export type { Mood };

export interface DraftResult {
  tone: "warm" | "direct" | "light";
  text: string;
  riskFlags: string[];
  bridgeQuestion: string;
  nvcVersion: string;
}

export interface AssistantResponse {
  drafts: DraftResult[];
  principles: string;
}

export interface AssistantInput {
  context: string;
  intent: string;
}

export interface SuggestionItem {
  type: "micro-gesture" | "small-plan" | "pro-plan" | "bridge-question";
  text: string;
  emoji: string;
}

export interface OfflineQueueItem {
  id: string;
  type: "create" | "update" | "delete";
  entity: "event" | "journal" | "mood";
  data: Record<string, unknown>;
  createdAt: number;
}
