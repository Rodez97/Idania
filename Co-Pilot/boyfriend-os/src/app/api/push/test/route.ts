import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/db";
import { sendPushNotification } from "@/lib/notifications";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: session.user.id },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No push subscriptions found" },
        { status: 404 },
      );
    }

    const payload = {
      title: "Boyfriend OS",
      body: "Notificaciones activadas!",
    };

    const results = await Promise.allSettled(
      subscriptions.map((sub: { endpoint: string; p256dh: string; auth: string }) =>
        sendPushNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        ),
      ),
    );

    const sent = results.filter((r: PromiseSettledResult<unknown>) => r.status === "fulfilled").length;
    const failed = results.filter((r: PromiseSettledResult<unknown>) => r.status === "rejected").length;

    return NextResponse.json({ sent, failed }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
