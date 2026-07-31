import type { ActivityLog, ActivityEntityType, ActivityAction } from "../types/workspace";

// ─── helpers ─────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function buildSentence(log: ActivityLog): string {
  const actor = log.actor_name ?? "Seseorang";
  const title = log.entity_title ? `"${log.entity_title}"` : "";

  const map: Record<ActivityEntityType, Record<ActivityAction, string>> = {
    task: {
      created: `${actor} membuat task ${title}`,
      updated: `${actor} mengubah task ${title}`,
      deleted: `${actor} menghapus task ${title}`,
      moved: `${actor} memindahkan task ${title}`,
      completed: `${actor} menyelesaikan task ${title}`,
      invited: `${actor} mengundang ke task ${title}`,
      removed: `${actor} dihapus dari task ${title}`,
    },
    board: {
      created: `${actor} membuat board ${title}`,
      updated: `${actor} mengubah board ${title}`,
      deleted: `${actor} menghapus board ${title}`,
      moved: `${actor} memindahkan board ${title}`,
      completed: `${actor} menyelesaikan board ${title}`,
      invited: `${actor} mengundang ke board ${title}`,
      removed: `${actor} dihapus dari board ${title}`,
    },
    workspace: {
      created: `${actor} membuat workspace ${title}`,
      updated: `${actor} mengubah pengaturan workspace`,
      deleted: `${actor} menghapus workspace`,
      moved: `${actor} memindahkan workspace`,
      completed: `${actor} menyelesaikan workspace`,
      invited: `${actor} mengundang ke workspace`,
      removed: `${actor} meninggalkan workspace`,
    },
    member: {
      invited: `${actor} mengundang ${title} ke workspace`,
      removed: `${actor} menghapus anggota dari workspace`,
      updated: `${actor} mengubah role anggota`,
      created: `${actor} bergabung ke workspace`,
      deleted: `${actor} meninggalkan workspace`,
      moved: `${actor} mengubah anggota`,
      completed: `${actor} mengubah anggota`,
    },
    message: {
      created: `${actor} mempublikasikan pesan ${title}`,
      updated: `${actor} mengubah pesan ${title}`,
      deleted: `${actor} menghapus pesan ${title}`,
      moved: `${actor} memindahkan pesan ${title}`,
      completed: `${actor} menyelesaikan pesan ${title}`,
      invited: `${actor} mengundang ke pesan ${title}`,
      removed: `${actor} menghapus dari pesan ${title}`,
    },
    comment: {
      created: `${actor} menambahkan komentar`,
      updated: `${actor} mengubah komentar`,
      deleted: `${actor} menghapus komentar`,
      moved: `${actor} memindahkan komentar`,
      completed: `${actor} menyelesaikan komentar`,
      invited: `${actor} mengundang ke komentar`,
      removed: `${actor} menghapus komentar`,
    },
  };

  return map[log.entity_type]?.[log.action] ?? `${actor} melakukan aksi`;
}

const ENTITY_ICON: Record<ActivityEntityType, React.ReactNode> = {
  task: (
    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  board: (
    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  workspace: (
    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  ),
  member: (
    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  message: (
    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  comment: (
    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 0012 20.25z" />
    </svg>
  ),
};

const ACTION_COLOR: Record<ActivityAction, string> = {
  created: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  updated: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  deleted: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  moved: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  completed: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  invited: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
  removed: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
};

function ActivityItem({ log }: { log: ActivityLog }) {
  const initials = log.actor_name
    ? log.actor_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="flex items-start gap-3 py-3">
      {/* Avatar */}
      {log.actor_avatar ? (
        <img
          src={log.actor_avatar}
          alt={log.actor_name ?? ""}
          className="size-7 rounded-full object-cover shrink-0 mt-0.5"
        />
      ) : (
        <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
          {initials}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">{buildSentence(log)}</p>
        <div className="flex items-center gap-2 mt-1">
          {/* Entity type badge */}
          <span
            className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium ${ACTION_COLOR[log.action]}`}
          >
            {ENTITY_ICON[log.entity_type]}
            {log.entity_type}
          </span>
          <span className="text-xs text-muted-foreground">{timeAgo(log.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

interface ActivityFeedProps {
  activities: ActivityLog[];
  /** compact = tanpa border card, untuk embed di overview */
  compact?: boolean;
}

export function ActivityFeed({ activities, compact = false }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className={compact ? "py-6" : "rounded-xl border border-border bg-card p-5"}>
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
          <svg
            className="size-8 mb-2 opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">Belum ada aktivitas</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="divide-y divide-border">
        {activities.map((log) => (
          <ActivityItem key={log.id} log={log} />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="size-7 rounded-md bg-muted flex items-center justify-center">
          <svg className="size-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-semibold text-sm">Aktivitas Terbaru</h3>
        <span className="ml-auto text-xs text-muted-foreground">{activities.length} entri</span>
      </div>
      <div className="divide-y divide-border">
        {activities.map((log) => (
          <ActivityItem key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
}
