import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notifications);
  } catch {
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
        { error: "Missing notification id" },
        { status: 400 },
      );
    }

    const existing = await prisma.notification.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json(notification);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
