import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/db";
import { z } from "zod/v4";
import { eventSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      where: { userId: session.user.id },
      include: { reminders: true },
      orderBy: { dateTime: "asc" },
    });

    return NextResponse.json(events);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = eventSchema.parse(body);

    const event = await prisma.event.create({
      data: {
        userId: session.user.id,
        title: data.title,
        dateTime: new Date(data.dateTime),
        category: data.category,
        notes: data.notes,
        reminders: {
          create: data.reminders.map((r) => ({
            offsetMinutes: r.offsetMinutes,
            channel: r.channel,
          })),
        },
      },
      include: { reminders: true },
    });

    return NextResponse.json(event, { status: 201 });
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

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing event id" },
        { status: 400 },
      );
    }

    const existing = await prisma.event.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const data = eventSchema.parse(body);

    // Delete old reminders and recreate
    await prisma.reminder.deleteMany({ where: { eventId: id } });

    const event = await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        dateTime: new Date(data.dateTime),
        category: data.category,
        notes: data.notes,
        reminders: {
          create: data.reminders.map((r) => ({
            offsetMinutes: r.offsetMinutes,
            channel: r.channel,
          })),
        },
      },
      include: { reminders: true },
    });

    return NextResponse.json(event);
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

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing event id" },
        { status: 400 },
      );
    }

    const existing = await prisma.event.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 },
      );
    }

    await prisma.event.delete({ where: { id } });

    return NextResponse.json({ message: "Event deleted" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
