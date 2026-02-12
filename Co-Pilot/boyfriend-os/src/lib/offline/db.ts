import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { OfflineQueueItem } from "@/types";

interface BoyfriendOSDB extends DBSchema {
  events: {
    key: string;
    value: {
      id: string;
      title: string;
      dateTime: string;
      category: string;
      notes?: string;
      userId: string;
    };
    indexes: { "by-date": string };
  };
  journal: {
    key: string;
    value: {
      id: string;
      happenedAt: string;
      mood: string;
      tags: string[];
      what: string;
      feelings?: string;
      outcome?: string;
      userId: string;
    };
    indexes: { "by-date": string };
  };
  mood: {
    key: string;
    value: {
      id: string;
      mood: string;
      createdAt: string;
      userId: string;
    };
  };
  queue: {
    key: string;
    value: OfflineQueueItem;
    indexes: { "by-created": number };
  };
  meta: {
    key: string;
    value: { key: string; value: string };
  };
}

let dbPromise: Promise<IDBPDatabase<BoyfriendOSDB>> | null = null;

export function getOfflineDB() {
  if (typeof window === "undefined") return null;

  if (!dbPromise) {
    dbPromise = openDB<BoyfriendOSDB>("boyfriend-os", 1, {
      upgrade(db) {
        const eventStore = db.createObjectStore("events", { keyPath: "id" });
        eventStore.createIndex("by-date", "dateTime");

        const journalStore = db.createObjectStore("journal", { keyPath: "id" });
        journalStore.createIndex("by-date", "happenedAt");

        db.createObjectStore("mood", { keyPath: "id" });

        const queueStore = db.createObjectStore("queue", { keyPath: "id" });
        queueStore.createIndex("by-created", "createdAt");

        db.createObjectStore("meta", { keyPath: "key" });
      },
    });
  }

  return dbPromise;
}

export async function setLastSync(timestamp: string) {
  const db = await getOfflineDB();
  if (!db) return;
  await db.put("meta", { key: "lastSyncAt", value: timestamp });
}

export async function getLastSync(): Promise<string | null> {
  const db = await getOfflineDB();
  if (!db) return null;
  const entry = await db.get("meta", "lastSyncAt");
  return entry?.value ?? null;
}
