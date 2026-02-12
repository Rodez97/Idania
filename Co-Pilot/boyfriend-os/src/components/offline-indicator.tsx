"use client";

import { useOffline } from "@/hooks/use-offline";
import { WifiOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
  const { isOnline, isSyncing } = useOffline();

  if (isOnline && !isSyncing) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300",
        "animate-in slide-in-from-top fade-in",
        !isOnline &&
          "bg-yellow-500/15 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
        isOnline &&
          isSyncing &&
          "bg-blue-500/15 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
      )}
    >
      {!isOnline && (
        <>
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>Sin conexion - Los cambios se guardaran localmente</span>
        </>
      )}
      {isOnline && isSyncing && (
        <>
          <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
          <span>Sincronizando cambios...</span>
        </>
      )}
    </div>
  );
}
