"use client";

import { DragOverlay } from "@dnd-kit/core";
import { useTaskDrag, DndProvider, DroppableColumn, ActiveTaskCard } from "../dnd";
import type { Task } from "../types/task";

interface TaskListProps {
  tasks: Task[];
  boardId: string;
}

export function TaskList({ tasks, boardId }: TaskListProps) {
  const {
    activeTask,
    sensors,
    collisionDetection,
    getTasksByStatus,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useTaskDrag(tasks);

  return (
    <DndProvider
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <DroppableColumn
          title="Todo"
          status="todo"
          tasks={getTasksByStatus("todo")}
          boardId={boardId}
        />
        <DroppableColumn
          title="In Progress"
          status="in_progress"
          tasks={getTasksByStatus("in_progress")}
          boardId={boardId}
        />
        <DroppableColumn
          title="Done"
          status="done"
          tasks={getTasksByStatus("done")}
          boardId={boardId}
        />
      </div>

      <DragOverlay>
        {activeTask ? <ActiveTaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndProvider>
  );
}
