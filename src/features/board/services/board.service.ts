import { getBoardsByUserId } from "../repository/board.repository";
import type { BoardWithTaskCount } from "../types/board";

export async function getUserBoards(userId: string): Promise<BoardWithTaskCount[]> {
  return getBoardsByUserId(userId);
}
