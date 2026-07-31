"use client";

import { BoardCard } from "./board-card";
import { CreateBoardDialog } from "./create-board-dialog";
import { Button } from "@/components/ui/button";
import type { BoardWithTaskCount } from "../types/board";

interface BoardListProps {
  boards: BoardWithTaskCount[];
}

export function BoardList({ boards }: BoardListProps) {
  if (boards.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed p-12 text-center"
        style={{ borderColor: "rgba(249,102,171,0.2)", background: "rgba(30,32,72,0.4)" }}
      >
        <div className="text-4xl mb-3">📋</div>
        <h3 className="font-semibold mb-2" style={{ color: "#E9CFE8" }}>Belum ada board</h3>
        <p className="text-sm mb-5 max-w-xs mx-auto" style={{ color: "rgba(233,207,232,0.5)" }}>
          Buat board untuk mulai mengorganisir task di workspace ini.
        </p>
        <CreateBoardDialog>
          <Button size="sm" style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)", color: "#fff", border: "none" }}>
            + Buat Board
          </Button>
        </CreateBoardDialog>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: "rgba(233,207,232,0.5)" }}>{boards.length} board</p>
        <CreateBoardDialog>
          <Button size="sm" style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)", color: "#fff", border: "none" }}>
            + Board Baru
          </Button>
        </CreateBoardDialog>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.map((board) => (
          <BoardCard key={board.id} board={board} />
        ))}
      </div>
    </div>
  );
}
