export interface AssistantInput {
  context: string;
  intent: string;
}

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

export interface AssistantProvider {
  generateDrafts(input: AssistantInput): Promise<AssistantResponse>;
}
