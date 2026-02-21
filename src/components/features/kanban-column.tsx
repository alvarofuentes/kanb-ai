'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from './task-card';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  colorClass: string;
}

export function KanbanColumn({ status, title, tasks, colorClass }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });
  const { t } = useLanguage();

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        'w-[250px] shrink-0 transition-colors flex flex-col whitespace-normal',
        isOver && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <CardHeader className={cn('p-4 pb-2', colorClass)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-1 pt-0">
        <ScrollArea className="h-[calc(100vh-320px)] min-h-[400px]">
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 p-1">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {tasks.length === 0 && (
                <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground">
                  {t.dropTasksHere}
                </div>
              )}
            </div>
          </SortableContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
