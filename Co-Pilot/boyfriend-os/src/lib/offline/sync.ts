"use client";

import { getOfflineDB, setLastSync } from "./db";
import { getQueueItems, removeFromQueue } from "./queue";

export async function syncOfflineData() {
  const items = await getQueueItems();
  if (items.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const item of items) {
    try {
      const endpoint = `/api/${item.entity}`;
      let method = "POST";
      let url = endpoint;

      if (item.type === "update") {
        method = "PUT";
        url = `${endpoint}?id=${(item.data as { id?: string }).id}`;
      } else if (item.type === "delete") {
        method = "DELETE";
        url = `${endpoint}?id=${(item.data as { id?: string }).id}`;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.data),
      });

      if (res.ok) {
        await removeFromQueue(item.id);
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  if (synced > 0) {
    await setLastSync(new Date().toISOString());
  }

  return { synced, failed };
}

export async function cacheEventsLocally(events: Array<Record<string, unknown>>) {
  const db = await getOfflineDB();
  if (!db) return;

  const tx = db.transaction("events", "readwrite");
  await tx.store.clear();
  for (const event of events) {
    await tx.store.put(event as never);
  }
  await tx.done;
}

export async function getCachedEvents() {
  const db = await getOfflineDB();
  if (!db) return [];
  return db.getAllFromIndex("events", "by-date");
}

export async function cacheJournalLocally(entries: Array<Record<string, unknown>>) {
  const db = await getOfflineDB();
  if (!db) return;

  const tx = db.transaction("journal", "readwrite");
  await tx.store.clear();
  for (const entry of entries) {
    await tx.store.put(entry as never);
  }
  await tx.done;
}

export async function getCachedJournal() {
  const db = await getOfflineDB();
  if (!db) return [];
  return db.getAllFromIndex("journal", "by-date");
}
