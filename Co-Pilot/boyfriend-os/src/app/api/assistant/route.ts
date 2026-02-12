import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/db";
import { z } from "zod/v4";
import { assistantSchema } from "@/lib/validations";
import type { AssistantProvider } from "@/lib/assistant/types";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = assistantSchema.parse(body);

    let provider: AssistantProvider;

    if (process.env.OPENAI_API_KEY) {
      const { OpenAIProvider } = await import("@/lib/assistant/openai-provider");
      provider = new OpenAIProvider();
    } else {
      const { MockProvider } = await import("@/lib/assistant/mock-provider");
      provider = new MockProvider();
    }

    const response = await provider.generateDrafts({
      context: data.context,
      intent: data.intent,
    });

    // Save all drafts to ConversationDraft table
    await Promise.all(
      response.drafts.map((draft) =>
        prisma.conversationDraft.create({
          data: {
            userId: session.user!.id!,
            inputContext: data.context,
            intent: data.intent,
            tone: draft.tone,
            outputText: draft.text,
            riskFlags: draft.riskFlags,
            bridgeQuestion: draft.bridgeQuestion,
            nvcVersion: draft.nvcVersion,
          },
        }),
      ),
    );

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
