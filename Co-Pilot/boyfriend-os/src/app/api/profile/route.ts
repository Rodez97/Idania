import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/db";
import { z } from "zod/v4";
import { profileSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.partnerProfile.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json(profile);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  return POST(request);
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = profileSchema.parse(body);

    const profile = await prisma.partnerProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        displayName: data.displayName,
        loveLanguages: data.loveLanguages,
        triggers: data.triggers,
        calmers: data.calmers,
        preferences: data.preferences as Record<string, string>,
        boundaries: data.boundaries,
      },
      update: {
        displayName: data.displayName,
        loveLanguages: data.loveLanguages,
        triggers: data.triggers,
        calmers: data.calmers,
        preferences: data.preferences as Record<string, string>,
        boundaries: data.boundaries,
      },
    });

    return NextResponse.json(profile);
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
