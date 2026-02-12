import { PrismaClient } from "@prisma/client";
import webpush from "web-push";

const prisma = new PrismaClient();

async function initPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL || "mailto:dev@example.com";

  if (publicKey && privateKey) {
    webpush.setVapidDetails(email, publicKey, privateKey);
    return true;
  }
  return false;
}

async function checkReminders() {
  console.log(`[${new Date().toISOString()}] Checking due reminders...`);

  const now = new Date();

  // Find reminders where:
  // event.dateTime - offsetMinutes <= now AND not yet sent
  const reminders = await prisma.reminder.findMany({
    where: {
      enabled: true,
      sent: false,
    },
    include: {
      event: {
        include: { user: true },
      },
    },
  });

  let sentCount = 0;

  for (const reminder of reminders) {
    const triggerTime = new Date(
      reminder.event.dateTime.getTime() - reminder.offsetMinutes * 60 * 1000,
    );

    if (triggerTime <= now) {
      console.log(`Reminder due: "${reminder.event.title}" for user ${reminder.event.userId}`);

      // Create in-app notification
      await prisma.notification.create({
        data: {
          userId: reminder.event.userId,
          title: `Recordatorio: ${reminder.event.title}`,
          body: reminder.event.notes || `Tu evento "${reminder.event.title}" se acerca.`,
        },
      });

      // Send push notification if channel is push
      if (reminder.channel === "push") {
        const subscriptions = await prisma.pushSubscription.findMany({
          where: { userId: reminder.event.userId },
        });

        for (const sub of subscriptions) {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth },
              },
              JSON.stringify({
                title: `Recordatorio: ${reminder.event.title}`,
                body: reminder.event.notes || `Tu evento "${reminder.event.title}" se acerca.`,
                url: "/events",
              }),
            );
          } catch (err) {
            console.error(`Failed to send push to ${sub.endpoint}:`, err);
            // Remove invalid subscription
            if ((err as { statusCode?: number }).statusCode === 410) {
              await prisma.pushSubscription.delete({ where: { id: sub.id } });
            }
          }
        }
      }

      // Mark as sent
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { sent: true },
      });

      sentCount++;
    }
  }

  console.log(`Processed ${sentCount} reminders.`);
}

async function main() {
  const pushEnabled = await initPush();
  console.log(`Push notifications: ${pushEnabled ? "enabled" : "disabled (no VAPID keys)"}`);
  console.log("Running reminder check...\n");

  await checkReminders();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
