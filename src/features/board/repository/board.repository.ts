import { createClient } from "@/lib/supabase/server";
import type { BoardWithTaskCount } from "../types/board";

export async function getBoardsByUserId(userId: string): Promise<BoardWithTaskCount[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("boards")
    .select(`
      *,
      tasks:tasks(count)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Gagal mengambil data board");
  }

  return data.map((board) => ({
    ...board,
    task_count: board.tasks?.[0]?.count ?? 0,
  }));
}
