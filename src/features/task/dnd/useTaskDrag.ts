"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { reorderTasks, type ReorderTask } from "../actions/task.actions";
import type { Task, TaskStatus } from "../types/task";

const STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

export function useTaskDrag(initialTasks: Task[]) {
  const [items, setItems] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  // keep a ref that always reflects latest items for use inside async functions
  const itemsRef = useRef<Task[]>(initialTasks);

  useEffect(() => {
    setItems(initialTasks);
    itemsRef.current = initialTasks;
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor)
  );

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => items.filter((t) => t.status === status),
    [items]
  );

  const findColumn = useCallback(
    (id: string): TaskStatus | null => {
      const task = itemsRef.current.find((t) => t.id === id);
      if (task) return task.status;
      if (id.startsWith("column-")) {
        return id.replace("column-", "") as TaskStatus;
      }
      return null;
    },
    []
  );

  function handleDragStart(event: DragStartEvent) {
    const task = itemsRef.current.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    setItems((prev) => {
      const idx = prev.findIndex((t) => t.id === activeId);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], status: overColumn as TaskStatus };
      itemsRef.current = updated;
      return updated;
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!activeColumn || !overColumn) return;

    // reorder within same column
    if (activeColumn === overColumn && activeId !== overId) {
      setItems((prev) => {
        const columnTasks = prev.filter((t) => t.status === activeColumn);
        const otherTasks = prev.filter((t) => t.status !== activeColumn);
        const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
        const newIndex = columnTasks.findIndex((t) => t.id === overId);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const reordered = arrayMove(columnTasks, oldIndex, newIndex);
        const updated = reordered.map((t, i) => ({ ...t, position: i }));
        const next = [...otherTasks, ...updated];
        itemsRef.current = next;
        return next;
      });
    }

    // give React a tick to apply state, then persist
    await new Promise<void>((r) => setTimeout(r, 50));
    await saveChanges();
  }

  async function saveChanges() {
    const current = itemsRef.current;
    const tasksToUpdate: ReorderTask[] = [];

    for (const status of STATUSES) {
      const columnTasks = current
        .filter((t) => t.status === status)
        .sort((a, b) => a.position - b.position);
      columnTasks.forEach((task, index) => {
        tasksToUpdate.push({ id: task.id, status: task.status, position: index });
      });
    }

    const originalItems = current;
    const result = await reorderTasks(tasksToUpdate);

    if (result?.error) {
      setItems(originalItems);
      itemsRef.current = originalItems;
      toast.error(result.error);
    }
  }

  return {
    items,
    activeTask,
    sensors,
    collisionDetection: closestCenter,
    getTasksByStatus,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
