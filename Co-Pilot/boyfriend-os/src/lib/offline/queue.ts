import { getOfflineDB } from "./db";
import type { OfflineQueueItem } from "@/types";

export async function addToQueue(item: Omit<OfflineQueueItem, "id" | "createdAt">) {
  const db = await getOfflineDB();
  if (!db) return;

  const queueItem: OfflineQueueItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };

  await db.add("queue", queueItem);
  return queueItem;
}

export async function getQueueItems(): Promise<OfflineQueueItem[]> {
  const db = await getOfflineDB();
  if (!db) return [];
  return db.getAllFromIndex("queue", "by-created");
}

export async function removeFromQueue(id: string) {
  const db = await getOfflineDB();
  if (!db) return;
  await db.delete("queue", id);
}

export async function clearQueue() {
  const db = await getOfflineDB();
  if (!db) return;
  await db.clear("queue");
}
