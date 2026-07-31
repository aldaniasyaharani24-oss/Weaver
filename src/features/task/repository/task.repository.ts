import { createClient } from "@/lib/supabase/server";
import type { Task } from "../types/task";

export async function getTasksByBoardId(boardId: string): Promise<Task[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("board_id", boardId)
    .order("position", { ascending: true });

  if (error) {
    throw new Error("Gagal mengambil data task");
  }

  return data;
}
