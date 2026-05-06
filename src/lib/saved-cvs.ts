import { useEffect, useState } from "react";

export interface SavedCV<T = unknown> {
  id: string;
  name: string;
  savedAt: string;
  data: T;
}

function read<T>(key: string): SavedCV<T>[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as SavedCV<T>[]) : [];
  } catch { return []; }
}

function write<T>(key: string, list: SavedCV<T>[]) {
  try { localStorage.setItem(key, JSON.stringify(list)); } catch {/* noop */}
}

export function useSavedCVs<T>(key: string = "saved_cvs_v1", defaults?: () => SavedCV<T>[]) {
  const [list, setList] = useState<SavedCV<T>[]>(() => {
    const existing = read<T>(key);
    if (existing.length === 0 && defaults) {
      const seeded = defaults();
      write(key, seeded);
      return seeded;
    }
    return existing;
  });

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) setList(read<T>(key));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  const save = (name: string, data: T) => {
    const item: SavedCV<T> = {
      id: crypto.randomUUID(),
      name: name.trim() || "Untitled",
      savedAt: new Date().toISOString(),
      data,
    };
    const next = [item, ...list];
    setList(next); write(key, next);
    return item;
  };

  const remove = (id: string) => {
    const next = list.filter((c) => c.id !== id);
    setList(next); write(key, next);
  };

  return { list, save, remove };
}
