import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface SavedItem<T = unknown> {
  id: string;
  name: string;
  savedAt: string;
  data: T;
}

type ItemTable = "resumes" | "cover_letters";

function useSupabaseSavedItems<T>(table: ItemTable) {
  const { user } = useAuth();
  const [list, setList] = useState<SavedItem<T>[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) { setList([]); setLoading(false); return; }
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from(table)
      .select("id, name, data, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }: { data: Array<{ id: string; name: string; data: unknown; created_at: string }> | null }) => {
        setList(
          (data ?? []).map((row) => ({
            id: row.id,
            name: row.name,
            savedAt: row.created_at,
            data: row.data as T,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [userId, table]);

  const save = useCallback(async (name: string, data: T): Promise<SavedItem<T>> => {
    if (!userId) throw new Error("Not authenticated");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (supabase as any)
      .from(table)
      .insert({ user_id: userId, name: name.trim() || "Untitled", data })
      .select("id, name, data, created_at")
      .single();
    if (error) throw error;
    const item: SavedItem<T> = {
      id: row.id,
      name: row.name,
      savedAt: row.created_at,
      data: row.data as T,
    };
    setList((prev) => [item, ...prev]);
    return item;
  }, [userId, table]);

  const remove = useCallback(async (id: string) => {
    if (!userId) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from(table).delete().eq("id", id).eq("user_id", userId);
    setList((prev) => prev.filter((i) => i.id !== id));
  }, [userId, table]);

  return { list, loading, save, remove };
}

export function useSavedResumes<T>() {
  return useSupabaseSavedItems<T>("resumes");
}

export function useSavedLetters<T>() {
  return useSupabaseSavedItems<T>("cover_letters");
}

/** Delete all resumes and cover letters for a user. Called on account deletion. */
export async function deleteAllSavedItems(userId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await Promise.all([
    (supabase as any).from("resumes").delete().eq("user_id", userId),
    (supabase as any).from("cover_letters").delete().eq("user_id", userId),
  ]);
}
