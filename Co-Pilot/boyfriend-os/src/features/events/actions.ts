"use server";

import prisma from "@/db";
import { auth } from "@/lib/auth";
import { eventSchema, type EventInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getEvents() {
  const userId = await requireUser();

  return prisma.event.findMany({
    where: { userId },
    orderBy: { dateTime: "desc" },
    include: { reminders: true },
  });
}

export async function getUpcomingEvents(days: number = 7) {
  const userId = await requireUser();

  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);

  return prisma.event.findMany({
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
}

export async function getEvent(id: string) {
  const userId = await requireUser();

  const event = await prisma.event.findFirst({
    where: { id, userId },
    include: { reminders: true },
  });

  if (!event) throw new Error("Event not found");
  return event;
}

export async function createEvent(data: EventInput) {
  const userId = await requireUser();

  const parsed = eventSchema.parse(data);

  const event = await prisma.event.create({
    data: {
      userId,
      title: parsed.title,
      dateTime: new Date(parsed.dateTime),
      category: parsed.category,
      notes: parsed.notes,
      reminders: {
        create: parsed.reminders.map((r) => ({
          offsetMinutes: r.offsetMinutes,
          channel: r.channel,
        })),
      },
    },
    include: { reminders: true },
  });

  revalidatePath("/events");
  return event;
}

export async function updateEvent(id: string, data: EventInput) {
  const userId = await requireUser();

  const parsed = eventSchema.parse(data);

  // Verify ownership
  const existing = await prisma.event.findFirst({
    where: { id, userId },
    include: { reminders: true },
  });
  if (!existing) throw new Error("Event not found");

  const event = await prisma.$transaction(async (tx) => {
    // Update the event itself
    const updated = await tx.event.update({
      where: { id },
      data: {
        title: parsed.title,
        dateTime: new Date(parsed.dateTime),
        category: parsed.category,
        notes: parsed.notes,
      },
    });

    // Delete old reminders and create new ones
    await tx.reminder.deleteMany({ where: { eventId: id } });

    if (parsed.reminders.length > 0) {
      await tx.reminder.createMany({
        data: parsed.reminders.map((r) => ({
          eventId: id,
          offsetMinutes: r.offsetMinutes,
          channel: r.channel,
        })),
      });
    }

    return tx.event.findUnique({
      where: { id },
      include: { reminders: true },
    });
  });

  revalidatePath("/events");
  return event;
}

export async function deleteEvent(id: string) {
  const userId = await requireUser();

  // Verify ownership
  const existing = await prisma.event.findFirst({
    where: { id, userId },
  });
  if (!existing) throw new Error("Event not found");

  await prisma.event.delete({ where: { id } });

  revalidatePath("/events");
  return { success: true };
}
