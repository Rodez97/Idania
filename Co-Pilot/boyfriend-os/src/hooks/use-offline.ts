"use client";

import { useState, useEffect, useCallback } from "react";
import { syncOfflineData } from "@/lib/offline/sync";

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = async () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      setIsSyncing(true);
      try {
        await syncOfflineData();
        setLastSync(new Date().toISOString());
      } finally {
        setIsSyncing(false);
      }
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const manualSync = useCallback(async () => {
    if (!navigator.onLine) return { synced: 0, failed: 0 };
    setIsSyncing(true);
    try {
      const result = await syncOfflineData();
      setLastSync(new Date().toISOString());
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return { isOnline, isSyncing, lastSync, manualSync };
}
