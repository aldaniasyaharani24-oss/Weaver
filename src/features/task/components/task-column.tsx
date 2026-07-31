"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "./task-card";
import { CreateTaskDialog } from "./create-task-dialog";
import { Button } from "@/components/ui/button";
import type { Task, TaskStatus } from "../types/task";

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  boardId: string;
}

export function TaskColumn({ title, status, tasks, boardId }: TaskColumnProps) {
  const taskIds = tasks.map((t) => t.id);

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">{title}</h3>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 min-h-[200px] p-2 rounded-lg transition-colors ${
          isOver ? "bg-muted ring-2 ring-primary/30" : "bg-muted/50"
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        <CreateTaskDialog boardId={boardId} defaultStatus={status}>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
            + Tambah Task
          </Button>
        </CreateTaskDialog>
      </div>
    </div>
  );
}
