'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTaskStore } from '@/store/task-store';
import { Task, TaskStatus } from '@/types/task';
import { KanbanColumn } from './kanban-column';
import { TaskCard } from './task-card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

const COLUMNS: TaskStatus[] = ['OPEN', 'PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];

export function KanbanBoard() {
  const { tasks, isLoading, error, updateTaskStatus } = useTaskStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const { t } = useLanguage();

  const statusLabels: Record<TaskStatus, { label: string; color: string }> = {
    OPEN: { label: t.open, color: 'bg-slate-100 dark:bg-slate-800' },
    PENDING: { label: t.pending, color: 'bg-amber-100 dark:bg-amber-900/40' },
    IN_PROGRESS: { label: t.inProgress, color: 'bg-blue-100 dark:bg-blue-900/40' },
    REVIEW: { label: t.review, color: 'bg-purple-100 dark:bg-purple-900/40' },
    COMPLETED: { label: t.completed, color: 'bg-green-100 dark:bg-green-900/40' },
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  }, [tasks]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const targetColumn = COLUMNS.find((col) => col === overId);

      if (targetColumn) {
        const task = tasks.find((t) => t.id === activeId);
        if (task && task.status !== targetColumn) {
          updateTaskStatus(activeId, targetColumn);
        }
      } else {
        const overTask = tasks.find((t) => t.id === overId);
        if (overTask && activeTask && activeTask.status !== overTask.status) {
          updateTaskStatus(activeId, overTask.status);
        }
      }
    },
    [tasks, activeTask, updateTaskStatus]
  );

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => tasks.filter((task) => task.status === status),
    [tasks]
  );

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max min-w-full justify-center gap-2 px-4 py-2">
          {COLUMNS.map((status) => (
            <SortableContext
              key={status}
              items={getTasksByStatus(status).map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                status={status}
                title={statusLabels[status].label}
                tasks={getTasksByStatus(status)}
                colorClass={statusLabels[status].color}
              />
            </SortableContext>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90">
            <TaskCard task={activeTask} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
