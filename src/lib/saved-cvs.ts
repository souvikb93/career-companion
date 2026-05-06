import { useEffect, useState } from "react";

export interface SavedCV<T = unknown> {
  id: string;
  name: string;
  savedAt: string;
  data: T;
}

const KEY = "saved_cvs_v1";

function read<T>(): SavedCV<T>[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedCV<T>[]) : [];
  } catch { return []; }
}

function write<T>(list: SavedCV<T>[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {/* noop */}
}

export function useSavedCVs<T>() {
  const [list, setList] = useState<SavedCV<T>[]>(() => read<T>());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setList(read<T>());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const save = (name: string, data: T) => {
    const item: SavedCV<T> = {
      id: crypto.randomUUID(),
      name: name.trim() || "Untitled CV",
      savedAt: new Date().toISOString(),
      data,
    };
    const next = [item, ...list];
    setList(next); write(next);
    return item;
  };

  const remove = (id: string) => {
    const next = list.filter((c) => c.id !== id);
    setList(next); write(next);
  };

  return { list, save, remove };
}
