"use server";

import prisma from "@/db";
import { auth } from "@/lib/auth";
import { journalSchema, type JournalInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import type { Mood } from "@prisma/client";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getJournalEntries() {
  const userId = await requireUser();

  return prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { happenedAt: "desc" },
  });
}

export async function getJournalEntry(id: string) {
  const userId = await requireUser();

  const entry = await prisma.journalEntry.findFirst({
    where: { id, userId },
  });

  if (!entry) throw new Error("Journal entry not found");
  return entry;
}

export async function createJournalEntry(data: JournalInput) {
  const userId = await requireUser();

  const parsed = journalSchema.parse(data);

  const entry = await prisma.journalEntry.create({
    data: {
      userId,
      happenedAt: parsed.happenedAt ? new Date(parsed.happenedAt) : new Date(),
      mood: parsed.mood as Mood,
      tags: parsed.tags,
      what: parsed.what,
      feelings: parsed.feelings,
      outcome: parsed.outcome,
    },
  });

  revalidatePath("/journal");
  return entry;
}

export async function updateJournalEntry(id: string, data: JournalInput) {
  const userId = await requireUser();

  const parsed = journalSchema.parse(data);

  // Verify ownership
  const existing = await prisma.journalEntry.findFirst({
    where: { id, userId },
  });
  if (!existing) throw new Error("Journal entry not found");

  const entry = await prisma.journalEntry.update({
    where: { id },
    data: {
      happenedAt: parsed.happenedAt ? new Date(parsed.happenedAt) : undefined,
      mood: parsed.mood as Mood,
      tags: parsed.tags,
      what: parsed.what,
      feelings: parsed.feelings,
      outcome: parsed.outcome,
    },
  });

  revalidatePath("/journal");
  return entry;
}

export async function deleteJournalEntry(id: string) {
  const userId = await requireUser();

  // Verify ownership
  const existing = await prisma.journalEntry.findFirst({
    where: { id, userId },
  });
  if (!existing) throw new Error("Journal entry not found");

  await prisma.journalEntry.delete({ where: { id } });

  revalidatePath("/journal");
  return { success: true };
}
