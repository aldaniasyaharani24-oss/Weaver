"use client";

import { TaskCard } from "../components/task-card";
import type { Task } from "../types/task";

interface ActiveTaskCardProps {
  task: Task;
}

export function ActiveTaskCard({ task }: ActiveTaskCardProps) {
  return (
    <div className="rotate-2 opacity-95 shadow-xl shadow-gray-300/60 scale-105">
      <TaskCard task={task} />
    </div>
  );
}
