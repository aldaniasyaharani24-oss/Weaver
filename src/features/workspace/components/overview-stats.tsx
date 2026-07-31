import type { WorkspaceOverview } from "../types/workspace";

interface OverviewStatsProps {
  overview: WorkspaceOverview;
  color: string;
}

function StatCard({ label, value, sub, accent, icon }: {
  label: string; value: number | string; sub?: string; accent?: string; icon: React.ReactNode;
}) {
  return (
    <div className="weaver-card rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm weaver-card-sub">{label}</p>
        <div className="size-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: accent ? `${accent}20` : undefined }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight weaver-card-title">{value}</p>
        {sub && <p className="text-xs weaver-card-sub mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function OverviewStats({ overview, color }: OverviewStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="col-span-2 lg:col-span-1 weaver-card rounded-xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm weaver-card-sub">Progress</p>
          <div className="size-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <svg className="size-4" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight weaver-card-title">{overview.progress}%</p>
          <div className="mt-2 h-2 w-full rounded-full weaver-progress-bg overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${overview.progress}%`, backgroundColor: color }} />
          </div>
          <p className="text-xs weaver-card-sub mt-1.5">
            {overview.done_tasks} dari {overview.total_tasks} task selesai
          </p>
        </div>
      </div>

      <StatCard label="Total Task" value={overview.total_tasks}
        sub={`${overview.in_progress_tasks} sedang dikerjakan`} accent={color}
        icon={<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />

      <StatCard label="Task Selesai" value={overview.done_tasks}
        sub={overview.total_tasks > 0 ? `${Math.round((overview.done_tasks / overview.total_tasks) * 100)}% rate` : "Belum ada task"}
        accent="#22c55e"
        icon={<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />

      <StatCard label="Task Terlambat" value={overview.overdue_tasks}
        sub={overview.overdue_tasks > 0 ? "Perlu segera ditangani" : "Semua on track"}
        accent={overview.overdue_tasks > 0 ? "#ef4444" : "#22c55e"}
        icon={<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
    </div>
  );
}
