"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "../components/task-card";
import type { Task } from "../types/task";

interface SortableTaskProps {
  task: Task;
}

export function SortableTask({ task }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-40 scale-95 rotate-1 transition-transform" : "transition-transform"}
    >
      {/* Drag handle area — hanya area ini yang bisa di-drag */}
      <div {...attributes} {...listeners} className="touch-none">
        <TaskCard task={task} />
      </div>
    </div>
  );
}
