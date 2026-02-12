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
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: "Missing required field: endpoint" },
        { status: 400 },
      );
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { message: "Subscription removed" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
