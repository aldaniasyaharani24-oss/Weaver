import Link from "next/link";
import { WorkspaceCardMenu } from "./workspace-card-menu";
import type { WorkspaceWithStats } from "../types/workspace";

interface WorkspaceCardProps {
  workspace: WorkspaceWithStats;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const color = workspace.color ?? "#E21C70";
  const initial = workspace.icon || workspace.name.charAt(0).toUpperCase();

  return (
    <Link href={`/workspaces/${workspace.id}`}
      className="weaver-card rounded-2xl overflow-hidden group block transition-all">
      <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: color }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0"
              style={{ backgroundColor: color }}>
              {initial}
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate weaver-card-title transition-colors">{workspace.name}</p>
              {workspace.description && (
                <p className="text-xs truncate mt-0.5 weaver-card-sub">{workspace.description}</p>
              )}
            </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
            onClick={(e) => e.preventDefault()}>
            <WorkspaceCardMenu workspace={workspace} />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="weaver-card-sub">Progress</span>
            <span className="font-semibold" style={{ color }}>{workspace.progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full weaver-progress-bg overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${workspace.progress}%`, backgroundColor: color }} />
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs weaver-card-sub pt-3 weaver-card-divider">
          <span className="flex items-center gap-1.5">
            <svg className="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {workspace.task_count} task
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            {workspace.member_count} anggota
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
            </svg>
            {workspace.board_count} board
          </span>
        </div>
      </div>
    </Link>
  );
}
