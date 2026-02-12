"use server";

import prisma from "@/db";
import { auth } from "@/lib/auth";
import { profileSchema, type ProfileInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getProfile() {
  const userId = await requireUser();

  return prisma.partnerProfile.findUnique({
    where: { userId },
  });
}

export async function upsertProfile(data: ProfileInput) {
  const userId = await requireUser();

  const parsed = profileSchema.parse(data);

  const profile = await prisma.partnerProfile.upsert({
    where: { userId },
    create: {
      userId,
      displayName: parsed.displayName,
      loveLanguages: parsed.loveLanguages,
      triggers: parsed.triggers,
      calmers: parsed.calmers,
      preferences: parsed.preferences as Record<string, string>,
      boundaries: parsed.boundaries,
    },
    update: {
      displayName: parsed.displayName,
      loveLanguages: parsed.loveLanguages,
      triggers: parsed.triggers,
      calmers: parsed.calmers,
      preferences: parsed.preferences as Record<string, string>,
      boundaries: parsed.boundaries,
    },
  });

  revalidatePath("/profile");
  return profile;
}
