"use client";

import Link from "next/link";
import { BoardCardMenu } from "./board-card-menu";
import type { BoardWithTaskCount } from "../types/board";

const COLORS = ["#E21C70","#7c3aed","#059669","#d97706","#dc2626","#2563eb","#db2777","#16a34a","#0891b2"];
function getColor(id: string) { return COLORS[id.charCodeAt(0) % COLORS.length]; }

interface BoardCardProps { board: BoardWithTaskCount }

export function BoardCard({ board }: BoardCardProps) {
  const color = getColor(board.id);
  const initial = board.title.charAt(0).toUpperCase();

  return (
    <Link href={`/board/${board.id}`}
      className="weaver-card rounded-2xl overflow-hidden group block transition-all">
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
              style={{ backgroundColor: color + "33", color }}>
              {initial}
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate text-sm weaver-card-title transition-colors">{board.title}</p>
              <p className="text-xs mt-0.5 weaver-card-sub">{board.task_count} task</p>
            </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
            onClick={(e) => e.preventDefault()}>
            <BoardCardMenu board={board} />
          </div>
        </div>
      </div>
    </Link>
  );
}
