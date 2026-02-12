"use server";

import prisma from "@/db";
import { auth } from "@/lib/auth";
import { assistantSchema, type AssistantInput } from "@/lib/validations";
import { MockProvider } from "@/lib/assistant/mock-provider";
import { OpenAIProvider } from "@/lib/assistant/openai-provider";
import type { AssistantProvider, AssistantResponse } from "@/lib/assistant/types";
import { revalidatePath } from "next/cache";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

function getProvider(): AssistantProvider {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAIProvider();
  }
  return new MockProvider();
}

export async function generateDrafts(data: AssistantInput): Promise<AssistantResponse> {
  const userId = await requireUser();

  const parsed = assistantSchema.parse(data);

  const provider = getProvider();
  const response = await provider.generateDrafts(parsed);

  // Save the 3 drafts as ConversationDraft records
  await prisma.conversationDraft.createMany({
    data: response.drafts.map((draft) => ({
      userId,
      inputContext: parsed.context,
      intent: parsed.intent,
      tone: draft.tone,
      outputText: draft.text,
      riskFlags: draft.riskFlags,
      bridgeQuestion: draft.bridgeQuestion,
      nvcVersion: draft.nvcVersion,
    })),
  });

  revalidatePath("/assistant");
  return response;
}

export async function getDraftHistory() {
  const userId = await requireUser();

  return prisma.conversationDraft.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}
