import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/db";
import { z } from "zod/v4";
import { journalSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entries = await prisma.journalEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { happenedAt: "desc" },
    });

    return NextResponse.json(entries);
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
    const data = journalSchema.parse(body);

    const entry = await prisma.journalEntry.create({
      data: {
        userId: session.user.id,
        happenedAt: data.happenedAt ? new Date(data.happenedAt) : new Date(),
        mood: data.mood,
        tags: data.tags,
        what: data.what,
        feelings: data.feelings,
        outcome: data.outcome,
      },
    });

    return NextResponse.json(entry, { status: 201 });
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
        { error: "Missing entry id" },
        { status: 400 },
      );
    }

    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Journal entry not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const data = journalSchema.parse(body);

    const entry = await prisma.journalEntry.update({
      where: { id },
      data: {
        happenedAt: data.happenedAt ? new Date(data.happenedAt) : undefined,
        mood: data.mood,
        tags: data.tags,
        what: data.what,
        feelings: data.feelings,
        outcome: data.outcome,
      },
    });

    return NextResponse.json(entry);
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
        { error: "Missing entry id" },
        { status: 400 },
      );
    }

    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Journal entry not found" },
        { status: 404 },
      );
    }

    await prisma.journalEntry.delete({ where: { id } });

    return NextResponse.json({ message: "Journal entry deleted" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
