import webpush from "web-push";

export function initWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL || "mailto:dev@example.com";

  if (publicKey && privateKey) {
    webpush.setVapidDetails(email, publicKey, privateKey);
  }
}

export async function sendPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: { title: string; body: string; url?: string },
) {
  initWebPush();

  return webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    },
    JSON.stringify(payload),
  );
}
