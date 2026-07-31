"use client";

import { useState } from "react";
import { format } from "date-fns";
import { EditTaskDialog } from "./edit-task-dialog";
import { DeleteTaskAlert } from "./delete-task-alert";
import type { Task } from "../types/task";

const PRIORITY = {
  low:    { label: "Low",    bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.3)",  color: "#22c55e" },
  medium: { label: "Medium", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", color: "#fbbf24" },
  high:   { label: "High",   bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)",  color: "#ef4444" },
};
const PRIORITY_DOT = { low: "#22c55e", medium: "#fbbf24", high: "#ef4444" };

export function TaskCard({ task }: { task: Task }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const p = PRIORITY[task.priority];
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";

  return (
    <>
      <EditTaskDialog task={task} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteTaskAlert task={task} open={deleteOpen} onOpenChange={setDeleteOpen} />

      <div className="weaver-card rounded-xl p-3.5 transition-all group cursor-grab active:cursor-grabbing select-none">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug flex-1 min-w-0 weaver-card-title">{task.title}</p>
          <div className="relative shrink-0">
            <button type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md -mr-1 -mt-0.5 weaver-card-sub">
              <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
              </svg>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onPointerDown={(e) => e.stopPropagation()} onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-6 z-20 w-36 rounded-xl py-1 overflow-hidden weaver-dropdown"
                  onPointerDown={(e) => e.stopPropagation()}>
                  <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm weaver-card-title hover:opacity-70 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setEditOpen(true); }}>
                    <svg className="size-3.5" style={{ color: "var(--weaver-accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                    Edit
                  </button>
                  <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-opacity"
                    style={{ color: "#ef4444" }}
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setDeleteOpen(true); }}>
                    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Hapus
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {task.description && (
          <p className="text-xs mt-1.5 line-clamp-2 leading-relaxed weaver-card-sub">{task.description}</p>
        )}

        <div className="flex items-center justify-between mt-3 pt-2.5 weaver-card-divider">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: p.bg, border: `1px solid ${p.border}`, color: p.color }}>
            <span className="size-1.5 rounded-full" style={{ backgroundColor: PRIORITY_DOT[task.priority] }} />
            {p.label}
          </span>
          {task.due_date && (
            <span className={`text-[10px] font-medium flex items-center gap-1 ${isOverdue ? "" : "weaver-card-sub"}`}
              style={{ color: isOverdue ? "#ef4444" : undefined }}>
              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {isOverdue ? "Terlambat · " : ""}{format(new Date(task.due_date), "d MMM")}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
