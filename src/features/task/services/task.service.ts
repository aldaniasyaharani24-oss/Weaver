import { getTasksByBoardId } from "../repository/task.repository";
import type { Task } from "../types/task";

export async function getBoardTasks(boardId: string): Promise<Task[]> {
  return getTasksByBoardId(boardId);
}
