export type TaskStatus = 'OPEN' | 'PENDING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  order: number;
  dueDate: string | null;
  tags: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedTask {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate?: string;
  tags?: string[];
}

export interface TaskStats {
  total: number;
  byStatus: {
    open: number;
    pending: number;
    inProgress: number;
    review: number;
    completed: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  completionRate: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  recentActivity: Array<{ day: string; count: number }>;
}

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  OPEN: { label: 'Open', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  PENDING: { label: 'Pending', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  REVIEW: { label: 'Review', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  COMPLETED: { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-100' },
};

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  LOW: { label: 'Low', color: 'text-slate-500', bgColor: 'bg-slate-50' },
  MEDIUM: { label: 'Medium', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  HIGH: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  URGENT: { label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-50' },
};
