"use client";

import {
  DndContext,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
  type CollisionDetection,
} from "@dnd-kit/core";

interface DndProviderProps {
  sensors: SensorDescriptor<SensorOptions>[];
  collisionDetection: CollisionDetection;
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  children: React.ReactNode;
}

export function DndProvider({
  sensors,
  collisionDetection,
  onDragStart,
  onDragOver,
  onDragEnd,
  children,
}: DndProviderProps) {
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      {children}
    </DndContext>
  );
}
