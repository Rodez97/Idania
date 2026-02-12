import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint, p256dh, auth: authKey } = body;

    if (!endpoint || !p256dh || !authKey) {
      return NextResponse.json(
        { error: "Missing required fields: endpoint, p256dh, auth" },
        { status: 400 },
      );
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh, auth: authKey, userId: session.user.id },
      create: {
        userId: session.user.id,
        endpoint,
        p256dh,
        auth: authKey,
      },
    });

    return NextResponse.json(
      { message: "Subscription saved" },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
