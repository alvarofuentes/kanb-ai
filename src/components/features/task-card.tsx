'use client';

import { useState, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  GripVertical,
  MoreVertical,
  Pencil,
  Trash2,
  CalendarIcon,
  AlertTriangle,
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { useTaskStore } from '@/store/task-store';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  const [editedPriority, setEditedPriority] = useState<TaskPriority>(task.priority);
  const [editedDueDate, setEditedDueDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  );
  const [editedStatus, setEditedStatus] = useState<TaskStatus>(task.status);

  const { updateTask, deleteTask, updateTaskStatus, updateTaskPriority } = useTaskStore();
  const { t } = useLanguage();

  const statusLabels: Record<TaskStatus, string> = {
    OPEN: t.open,
    PENDING: t.pending,
    IN_PROGRESS: t.inProgress,
    REVIEW: t.review,
    COMPLETED: t.completed,
  };

  const priorityLabels: Record<TaskPriority, string> = {
    LOW: t.low,
    MEDIUM: t.medium,
    HIGH: t.high,
    URGENT: t.urgent,
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveEdit = useCallback(async () => {
    await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: task.id,
        title: editedTitle,
        description: editedDescription,
        priority: editedPriority,
        dueDate: editedDueDate?.toISOString(),
        status: editedStatus,
      }),
    });
    updateTask(task.id, {
      title: editedTitle,
      description: editedDescription,
      priority: editedPriority,
      dueDate: editedDueDate?.toISOString() || null,
      status: editedStatus,
    });
    setIsEditDialogOpen(false);
  }, [task.id, editedTitle, editedDescription, editedPriority, editedDueDate, editedStatus, updateTask]);

  const handleDelete = useCallback(async () => {
    deleteTask(task.id);
  }, [task.id, deleteTask]);

  const handlePriorityChange = useCallback(
    async (priority: TaskPriority) => {
      updateTaskPriority(task.id, priority);
    },
    [task.id, updateTaskPriority]
  );

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'COMPLETED';

  if (isSortableDragging && isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50"
      />
    );
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          'cursor-grab transition-shadow hover:shadow-md w-full',
          isSortableDragging && 'opacity-50',
          isOverdue && 'border-red-500/50 bg-red-50/50 dark:bg-red-950/30'
        )}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <button
              {...attributes}
              {...listeners}
              className="mt-1 cursor-grab text-muted-foreground hover:text-foreground"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium leading-tight break-words">
                  {task.title}
                </h4>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      {t.edit}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handlePriorityChange('LOW')}
                      className={task.priority === 'LOW' ? 'bg-accent' : ''}
                    >
                      {t.priority}: {t.low}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handlePriorityChange('MEDIUM')}
                      className={task.priority === 'MEDIUM' ? 'bg-accent' : ''}
                    >
                      {t.priority}: {t.medium}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handlePriorityChange('HIGH')}
                      className={task.priority === 'HIGH' ? 'bg-accent' : ''}
                    >
                      {t.priority}: {t.high}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handlePriorityChange('URGENT')}
                      className={task.priority === 'URGENT' ? 'bg-accent' : ''}
                    >
                      {t.priority}: {t.urgent}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      {t.delete}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {task.description && (
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {task.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] px-1.5 py-0',
                    task.priority === 'URGENT' && 'text-red-600',
                    task.priority === 'HIGH' && 'text-orange-600',
                    task.priority === 'MEDIUM' && 'text-amber-600',
                    task.priority === 'LOW' && 'text-slate-600'
                  )}
                >
                  {priorityLabels[task.priority]}
                </Badge>

                {task.dueDate && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'h-5 px-1.5 text-[10px]',
                          isOverdue && 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300'
                        )}
                      >
                        {isOverdue ? (
                          <AlertTriangle className="mr-1 h-3 w-3" />
                        ) : (
                          <CalendarIcon className="mr-1 h-3 w-3" />
                        )}
                        {format(new Date(task.dueDate), 'MMM d')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={task.dueDate ? new Date(task.dueDate) : undefined}
                        disabled
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t.edit}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">{t.title}</label>
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder={t.titlePlaceholder}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">{t.description}</label>
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder={t.descriptionPlaceholder}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">{t.status}</label>
                <Select
                  value={editedStatus}
                  onValueChange={(value) => setEditedStatus(value as TaskStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">{t.priority}</label>
                <Select
                  value={editedPriority}
                  onValueChange={(value) => setEditedPriority(value as TaskPriority)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">{t.dueDate}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editedDueDate ? format(editedDueDate, 'PPP') : t.pickADate}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={editedDueDate}
                    onSelect={setEditedDueDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleSaveEdit}>{t.edit}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
