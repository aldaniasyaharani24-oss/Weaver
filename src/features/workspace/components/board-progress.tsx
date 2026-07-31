import Link from "next/link";
import type { BoardOverviewItem } from "../types/workspace";

interface BoardProgressProps {
  boards: BoardOverviewItem[];
  accentColor: string;
}

export function BoardProgress({ boards, accentColor }: BoardProgressProps) {
  if (boards.length === 0) {
    return (
      <div className="weaver-card rounded-2xl p-5">
        <h3 className="font-semibold text-sm mb-4 weaver-card-title">Progress per Board</h3>
        <div className="flex flex-col items-center justify-center py-8 weaver-card-sub">
          <svg className="size-8 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          <p className="text-sm">Belum ada board di workspace ini</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weaver-card rounded-2xl p-5">
      <h3 className="font-semibold text-sm mb-4 weaver-card-title">Progress per Board</h3>
      <div className="space-y-4">
        {boards.map((board) => (
          <Link key={board.id} href={`/board/${board.id}`} className="block group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium weaver-card-title group-hover:opacity-70 transition-opacity truncate max-w-[200px]">
                {board.title}
              </span>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <span className="text-xs weaver-card-sub">{board.done_count}/{board.task_count} task</span>
                <span className="text-xs font-semibold w-9 text-right"
                  style={{ color: board.progress === 100 ? "#22c55e" : accentColor }}>
                  {board.progress}%
                </span>
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full weaver-progress-bg overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${board.progress}%`, backgroundColor: board.progress === 100 ? "#22c55e" : accentColor }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
