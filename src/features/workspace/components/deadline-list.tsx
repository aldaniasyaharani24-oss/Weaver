import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { OverviewTask } from "../types/workspace";

interface DeadlineListProps {
  upcoming: OverviewTask[];
  overdue: OverviewTask[];
}

const PRIORITY_CONFIG = {
  high: { label: "Tinggi", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  medium: { label: "Sedang", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  low: { label: "Rendah", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
} as const;

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysLeft(iso: string): number {
  const now = new Date();
  const due = new Date(iso);
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function TaskRow({ task, isOverdue }: { task: OverviewTask; isOverdue?: boolean }) {
  const days = daysLeft(task.due_date);
  const priority = PRIORITY_CONFIG[task.priority];

  return (
    <Link
      href={`/board/${task.board_id}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/60 transition-colors group"
    >
      {/* Status indicator */}
      <div
        className={`size-2 rounded-full shrink-0 ${
          isOverdue ? "bg-red-500" : days <= 1 ? "bg-orange-500" : "bg-yellow-500"
        }`}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-foreground">
          {task.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">{task.board_title}</p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        <Badge className={`text-xs px-1.5 py-0 font-normal ${priority.className}`}>
          {priority.label}
        </Badge>
        <span
          className={`text-xs font-medium ${
            isOverdue
              ? "text-red-600 dark:text-red-400"
              : days <= 1
              ? "text-orange-600 dark:text-orange-400"
              : "text-muted-foreground"
          }`}
        >
          {isOverdue
            ? `${Math.abs(days)} hari lalu`
            : days === 0
            ? "Hari ini"
            : days === 1
            ? "Besok"
            : formatDate(task.due_date)}
        </span>
      </div>
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      <svg
        className="size-8 mb-2 opacity-40"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
        />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function DeadlineList({ upcoming, overdue }: DeadlineListProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Deadline Terdekat */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-7 rounded-md bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <svg
              className="size-4 text-yellow-600 dark:text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-sm">Deadline Terdekat</h3>
          {upcoming.length > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">7 hari ke depan</span>
          )}
        </div>

        {upcoming.length === 0 ? (
          <EmptyState message="Tidak ada deadline dalam 7 hari ke depan" />
        ) : (
          <div className="space-y-1">
            {upcoming.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* Task Terlambat */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-7 rounded-md bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg
              className="size-4 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-sm">Task Terlambat</h3>
          {overdue.length > 0 && (
            <span className="ml-auto text-xs font-medium text-red-600 dark:text-red-400">
              {overdue.length} task
            </span>
          )}
        </div>

        {overdue.length === 0 ? (
          <EmptyState message="Tidak ada task yang terlambat" />
        ) : (
          <div className="space-y-1">
            {overdue.map((task) => (
              <TaskRow key={task.id} task={task} isOverdue />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
