"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTask } from "./SortableTask";
import { CreateTaskDialog } from "../components/create-task-dialog";
import type { Task, TaskStatus } from "../types/task";

interface DroppableColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  boardId: string;
}

const COLUMN_STATUS = {
  todo:        { dotClass: "board-dot-todo",     textClass: "board-col-todo-text"     },
  in_progress: { dotClass: "board-dot-progress", textClass: "board-col-progress-text" },
  done:        { dotClass: "board-dot-done",     textClass: "board-col-done-text"     },
} as const;

// Empty state illustration per kolom
function EmptyIllustration({ status }: { status: TaskStatus }) {
  if (status === "todo") return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="opacity-40">
      <rect x="15" y="10" width="50" height="60" rx="6" className="board-empty-stroke" strokeWidth="2" fill="none"/>
      <line x1="25" y1="28" x2="55" y2="28" className="board-empty-stroke" strokeWidth="2"/>
      <line x1="25" y1="38" x2="50" y2="38" className="board-empty-stroke" strokeWidth="2"/>
      <line x1="25" y1="48" x2="45" y2="48" className="board-empty-stroke" strokeWidth="2"/>
      <rect x="22" y="24" width="4" height="4" rx="1" className="board-empty-fill"/>
      <rect x="22" y="34" width="4" height="4" rx="1" className="board-empty-fill"/>
      <rect x="22" y="44" width="4" height="4" rx="1" className="board-empty-fill"/>
    </svg>
  );
  if (status === "in_progress") return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="opacity-40">
      <circle cx="40" cy="40" r="28" className="board-empty-stroke" strokeWidth="2" fill="none"/>
      <path d="M40 15 A25 25 0 0 1 65 40" className="board-empty-stroke-accent" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <circle cx="40" cy="40" r="4" className="board-empty-fill-accent"/>
      <line x1="40" y1="40" x2="40" y2="22" className="board-empty-stroke-accent" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="40" y1="40" x2="54" y2="40" className="board-empty-stroke-accent" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="opacity-40">
      <rect x="15" y="15" width="50" height="50" rx="8" className="board-empty-stroke" strokeWidth="2" fill="none"/>
      <path d="M28 40 L36 48 L52 32" className="board-empty-stroke-done" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export function DroppableColumn({ title, status, tasks, boardId }: DroppableColumnProps) {
  const taskIds = tasks.map((t) => t.id);
  const { setNodeRef, isOver } = useDroppable({ id: `column-${status}` });
  const cfg = COLUMN_STATUS[status];

  return (
    <div className="flex flex-col gap-3">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`size-2.5 rounded-full ${cfg.dotClass}`} />
          <h3 className={`text-sm font-semibold ${cfg.textClass}`}>{title}</h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full board-count-badge">
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div ref={setNodeRef}
        className={`flex flex-col gap-2.5 min-h-[420px] p-3 rounded-2xl border-2 transition-all duration-150 board-col-${status} ${isOver ? "board-col-over" : ""}`}>

        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} />
          ))}
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8">
            <EmptyIllustration status={status} />
            <div className="text-center">
              <p className="text-sm font-medium board-empty-title">
                {status === "todo" ? "Belum ada task" :
                 status === "in_progress" ? "Tidak ada task berjalan" :
                 "Belum ada task selesai"}
              </p>
              <p className="text-xs board-empty-sub mt-0.5">
                {status === "todo" ? "Task akan muncul di sini" :
                 status === "in_progress" ? "Pindahkan task ke kolom ini" :
                 "Task yang selesai akan muncul di sini"}
              </p>
            </div>
            <CreateTaskDialog boardId={boardId} defaultStatus={status}>
              <button type="button" className="board-add-btn flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all">
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                + Tambah Task
              </button>
            </CreateTaskDialog>
          </div>
        )}

        {/* Add task at bottom when has tasks */}
        {tasks.length > 0 && (
          <CreateTaskDialog boardId={boardId} defaultStatus={status}>
            <button type="button"
              className="mt-auto w-full flex items-center justify-center gap-1.5 py-2 text-xs rounded-xl transition-all border border-dashed board-add-bottom">
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Tambah Task
            </button>
          </CreateTaskDialog>
        )}
      </div>
    </div>
  );
}
