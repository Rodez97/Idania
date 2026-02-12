import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/db";

interface OfflineMutation {
  type: "create" | "update" | "delete";
  entity: "event" | "journal" | "mood" | "conflict";
  data: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const mutations: OfflineMutation[] = body;

    if (!Array.isArray(mutations)) {
      return NextResponse.json(
        { error: "Expected an array of mutations" },
        { status: 400 },
      );
    }

    let synced = 0;
    let failed = 0;

    for (const mutation of mutations) {
      try {
        await processMutation(mutation, session.user.id);
        synced++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({ synced, failed });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function processMutation(mutation: OfflineMutation, userId: string) {
  const { type, entity, data } = mutation;

  switch (entity) {
    case "event":
      return processEventMutation(type, data, userId);
    case "journal":
      return processJournalMutation(type, data, userId);
    case "mood":
      return processMoodMutation(type, data, userId);
    case "conflict":
      return processConflictMutation(type, data, userId);
    default:
      throw new Error(`Unknown entity: ${entity}`);
  }
}

async function processEventMutation(
  type: string,
  data: Record<string, unknown>,
  userId: string,
) {
  switch (type) {
    case "create":
      return prisma.event.create({
        data: {
          userId,
          title: data.title as string,
          dateTime: new Date(data.dateTime as string),
          category: (data.category as string) || "general",
          notes: data.notes as string | undefined,
        },
      });
    case "update":
      return prisma.event.updateMany({
        where: { id: data.id as string, userId },
        data: {
          title: data.title as string,
          dateTime: data.dateTime ? new Date(data.dateTime as string) : undefined,
          category: data.category as string | undefined,
          notes: data.notes as string | undefined,
        },
      });
    case "delete":
      return prisma.event.deleteMany({
        where: { id: data.id as string, userId },
      });
    default:
      throw new Error(`Unknown mutation type: ${type}`);
  }
}

async function processJournalMutation(
  type: string,
  data: Record<string, unknown>,
  userId: string,
) {
  switch (type) {
    case "create":
      return prisma.journalEntry.create({
        data: {
          userId,
          happenedAt: data.happenedAt ? new Date(data.happenedAt as string) : new Date(),
          mood: data.mood as "ok" | "distant" | "tense" | "great",
          tags: (data.tags as string[]) || [],
          what: data.what as string,
          feelings: data.feelings as string | undefined,
          outcome: data.outcome as string | undefined,
        },
      });
    case "update":
      return prisma.journalEntry.updateMany({
        where: { id: data.id as string, userId },
        data: {
          happenedAt: data.happenedAt ? new Date(data.happenedAt as string) : undefined,
          mood: data.mood as "ok" | "distant" | "tense" | "great" | undefined,
          tags: data.tags as string[] | undefined,
          what: data.what as string | undefined,
          feelings: data.feelings as string | undefined,
          outcome: data.outcome as string | undefined,
        },
      });
    case "delete":
      return prisma.journalEntry.deleteMany({
        where: { id: data.id as string, userId },
      });
    default:
      throw new Error(`Unknown mutation type: ${type}`);
  }
}

async function processMoodMutation(
  type: string,
  data: Record<string, unknown>,
  userId: string,
) {
  switch (type) {
    case "create":
      return prisma.moodEntry.create({
        data: {
          userId,
          mood: data.mood as "ok" | "distant" | "tense" | "great",
        },
      });
    default:
      throw new Error(`Mood entries only support 'create' mutation, got: ${type}`);
  }
}

async function processConflictMutation(
  type: string,
  data: Record<string, unknown>,
  userId: string,
) {
  switch (type) {
    case "create":
      return prisma.conflictCase.create({
        data: {
          userId,
          topic: data.topic as string,
          intensity: (data.intensity as number) || 5,
          goal: (data.goal as string) || "repair",
        },
      });
    case "update":
      return prisma.conflictCase.updateMany({
        where: { id: data.id as string, userId },
        data: {
          resolutionNotes: data.resolutionNotes as string | undefined,
          learnings: data.learnings as string[] | undefined,
        },
      });
    case "delete":
      return prisma.conflictCase.deleteMany({
        where: { id: data.id as string, userId },
      });
    default:
      throw new Error(`Unknown mutation type: ${type}`);
  }
}
