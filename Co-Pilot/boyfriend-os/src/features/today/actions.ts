"use server";

import prisma from "@/db";
import { auth } from "@/lib/auth";
import { moodSchema } from "@/lib/validations";
import { generateSuggestions } from "@/lib/suggestions";
import { revalidatePath } from "next/cache";
import type { Mood } from "@prisma/client";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getTodayData() {
  const userId = await requireUser();

  // Get latest mood entry for user
  const latestMood = await prisma.moodEntry.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Get upcoming events (7 days)
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + 7);

  const upcomingEvents = await prisma.event.findMany({
    where: {
      userId,
      dateTime: {
        gte: now,
        lte: future,
      },
    },
    orderBy: { dateTime: "asc" },
    include: { reminders: true },
  });

  // Check if user has a partner profile
  const partnerProfile = await prisma.partnerProfile.findUnique({
    where: { userId },
  });

  // Count recent conflicts (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentConflicts = await prisma.conflictCase.count({
    where: {
      userId,
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  // Generate suggestions based on context
  const suggestions = generateSuggestions({
    mood: latestMood?.mood ?? null,
    upcomingEventsCount: upcomingEvents.length,
    hasPartnerProfile: !!partnerProfile,
    recentConflicts,
  });

  return {
    suggestions,
    upcomingEvents,
    currentMood: latestMood?.mood ?? null,
  };
}

export async function setMood(mood: Mood) {
  const userId = await requireUser();

  const parsed = moodSchema.parse({ mood });

  const entry = await prisma.moodEntry.create({
    data: {
      userId,
      mood: parsed.mood as Mood,
    },
  });

  revalidatePath("/today");
  return entry;
}
