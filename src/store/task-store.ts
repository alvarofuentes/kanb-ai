import { create } from 'zustand';
import { Task, TaskStats, TaskStatus, TaskPriority } from '@/types/task';

interface TaskStore {
  tasks: Task[];
  stats: TaskStats | null;
  isLoading: boolean;
  error: string | null;
  selectedTask: Task | null;

  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  setStats: (stats: TaskStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedTask: (task: Task | null) => void;

  // API Actions
  fetchTasks: (userId?: string) => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<Task | null>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  updateTaskPriority: (id: string, priority: TaskPriority) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  fetchStats: (userId?: string) => Promise<void>;
  clearAllTasks: (userId: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  stats: null,
  isLoading: false,
  error: null,
  selectedTask: null,

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSelectedTask: (task) => set({ selectedTask: task }),

  fetchTasks: async (userId = 'default-user') => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/tasks?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        set({ tasks: data.tasks, isLoading: false });
      } else {
        set({ error: data.error, isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
        isLoading: false,
      });
    }
  },

  createTask: async (task) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, userId: task.userId || 'default-user' }),
      });
      const data = await response.json();
      if (data.success) {
        get().addTask(data.task);
        set({ isLoading: false });
        return data.task;
      } else {
        set({ error: data.error, isLoading: false });
        return null;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create task',
        isLoading: false,
      });
      return null;
    }
  },

  updateTaskStatus: async (id, status) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await response.json();
      if (data.success) {
        get().updateTask(id, { status });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update task',
      });
    }
  },

  updateTaskPriority: async (id, priority) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, priority }),
      });
      const data = await response.json();
      if (data.success) {
        get().updateTask(id, { priority });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update task',
      });
    }
  },

  deleteTask: async (id) => {
    try {
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        get().removeTask(id);
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete task',
      });
    }
  },

  fetchStats: async (userId = 'default-user') => {
    try {
      const response = await fetch(`/api/tasks/stats?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        set({ stats: data.stats });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
      });
    }
  },

  clearAllTasks: async (userId) => {
    try {
      const response = await fetch(`/api/tasks/clear?userId=${userId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        set({ tasks: [] });
        get().fetchStats(userId); // Recargar stats vacíos
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to clear tasks',
      });
    }
  },
}));
