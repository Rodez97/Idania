"use client";

import { useState, useEffect, useCallback } from "react";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return false;
    }

    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm !== "granted") return false;

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey("p256dh")!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey("auth")!))),
        },
      }),
    });

    if (res.ok) {
      setIsSubscribed(true);
      return true;
    }
    return false;
  }, []);

  const unsubscribe = useCallback(async () => {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
    }
    setIsSubscribed(false);
  }, []);

  return { permission, isSubscribed, subscribe, unsubscribe };
}
