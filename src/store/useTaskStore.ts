import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ExhibitionTask, TaskStatus, TaskFilters, UserRole, TaskPhoto, AcceptanceError, RiskLevel } from '../types';
import { SEED_TASKS, USERS, ROLE_PERMISSIONS } from '../data/seed';

interface TaskStore {
  tasks: ExhibitionTask[];
  currentUserId: string;
  filters: TaskFilters;
  lastSynced: string | null;
  isOffline: boolean;
  setCurrentUser: (userId: string) => void;
  getCurrentUser: () => typeof USERS[0] | undefined;
  getCurrentRole: () => UserRole;
  hasPermission: (permission: 'canAccept' | 'canEdit' | 'canDelete') => boolean;
  getVisibleTasks: () => ExhibitionTask[];
  getFilteredTasks: () => ExhibitionTask[];
  getTasksByStatus: (status: TaskStatus) => ExhibitionTask[];
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  moveTask: (taskId: string, newStatus: TaskStatus, newOrder: number) => void;
  reorderTask: (taskId: string, newOrder: number, status: TaskStatus) => void;
  validateAcceptance: (taskId: string) => AcceptanceError | null;
  acceptTask: (taskId: string) => { success: boolean; error?: AcceptanceError };
  rejectTask: (taskId: string, reason: string) => void;
  addPhoto: (taskId: string, photo: Omit<TaskPhoto, 'id'>) => void;
  removePhoto: (taskId: string, photoId: string) => void;
  updateTask: (taskId: string, updates: Partial<ExhibitionTask>) => void;
  getProgressStats: () => {
    total: number;
    done: number;
    inProgress: number;
    review: number;
    todo: number;
    overdue: number;
    noPhotos: number;
    percentage: number;
  };
  getRiskStats: () => Record<RiskLevel, number>;
  isOverdue: (task: ExhibitionTask) => boolean;
  resetToSeed: () => void;
  setOffline: (offline: boolean) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: SEED_TASKS,
      currentUserId: 'user-pm',
      filters: {
        zone: null,
        riskLevel: null,
        assignee: null,
        search: '',
      },
      lastSynced: new Date().toISOString(),
      isOffline: false,

      setCurrentUser: (userId) => set({ currentUserId: userId }),

      getCurrentUser: () => USERS.find((u) => u.id === get().currentUserId),

      getCurrentRole: () => {
        const user = get().getCurrentUser();
        return user?.role || 'project_manager';
      },

      hasPermission: (permission) => {
        const role = get().getCurrentRole();
        return ROLE_PERMISSIONS[role]?.[permission] ?? false;
      },

      getVisibleTasks: () => {
        const { tasks } = get();
        const role = get().getCurrentRole();
        const permissions = ROLE_PERMISSIONS[role];
        if (!permissions) return tasks;
        return tasks.filter((t) => permissions.visibleStatuses.includes(t.status));
      },

      getFilteredTasks: () => {
        let tasks = get().getVisibleTasks();
        const { filters } = get();

        if (filters.zone) {
          tasks = tasks.filter((t) => t.zone === filters.zone);
        }
        if (filters.riskLevel) {
          tasks = tasks.filter((t) => t.riskLevel === filters.riskLevel);
        }
        if (filters.assignee) {
          tasks = tasks.filter((t) => t.assigneeId === filters.assignee);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          tasks = tasks.filter(
            (t) =>
              t.title.toLowerCase().includes(searchLower) ||
              t.description.toLowerCase().includes(searchLower)
          );
        }

        return tasks;
      },

      getTasksByStatus: (status) => {
        return get()
          .getFilteredTasks()
          .filter((t) => t.status === status)
          .sort((a, b) => a.order - b.order);
      },

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      clearFilters: () =>
        set({
          filters: { zone: null, riskLevel: null, assignee: null, search: '' },
        }),

      moveTask: (taskId, newStatus, newOrder) => {
        set((state) => {
          const tasks = state.tasks.map((t) => {
            if (t.id === taskId) {
              return {
                ...t,
                status: newStatus,
                order: newOrder,
                updatedAt: new Date().toISOString(),
              };
            }
            if (t.status === newStatus && t.order >= newOrder) {
              return { ...t, order: t.order + 1 };
            }
            return t;
          });
          return { tasks, lastSynced: new Date().toISOString() };
        });
      },

      reorderTask: (taskId, newOrder, status) => {
        set((state) => {
          const tasks = [...state.tasks];
          const taskIndex = tasks.findIndex((t) => t.id === taskId);
          if (taskIndex === -1) return state;

          const task = tasks[taskIndex];
          const oldOrder = task.order;

          if (oldOrder === newOrder) return state;

          tasks.forEach((t) => {
            if (t.id === taskId) {
              t.order = newOrder;
              t.updatedAt = new Date().toISOString();
            } else if (t.status === status) {
              if (oldOrder < newOrder && t.order > oldOrder && t.order <= newOrder) {
                t.order = t.order - 1;
              } else if (oldOrder > newOrder && t.order >= newOrder && t.order < oldOrder) {
                t.order = t.order + 1;
              }
            }
          });

          return { tasks, lastSynced: new Date().toISOString() };
        });
      },

      isOverdue: (task) => {
        if (task.status === 'done') return false;
        const deadline = new Date(task.deadline);
        const now = new Date();
        deadline.setHours(23, 59, 59, 999);
        return now > deadline;
      },

      validateAcceptance: (taskId) => {
        const { tasks } = get();
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return { type: 'no_photos', message: '任务不存在' };

        if (!task.photos || task.photos.length === 0) {
          return {
            type: 'no_photos',
            message: '缺少验收证据！请先上传布展照片后再进行验收。',
          };
        }

        if (task.riskLevel === 'critical' || task.riskLevel === 'high') {
          return {
            type: 'risk_pending',
            message: `存在${task.riskLevel === 'critical' ? '严重' : '高'}风险未处理，请先排除风险后再验收。`,
          };
        }

        if (get().isOverdue(task)) {
          return {
            type: 'overdue',
            message: '任务已超期，需要项目经理审批后才能验收。',
          };
        }

        return null;
      },

      acceptTask: (taskId) => {
        const error = get().validateAcceptance(taskId);
        if (error) {
          return { success: false, error };
        }

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, status: 'done', updatedAt: new Date().toISOString() }
              : t
          ),
          lastSynced: new Date().toISOString(),
        }));

        return { success: true };
      },

      rejectTask: (taskId, reason) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'in_progress',
                  notes: reason,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
          lastSynced: new Date().toISOString(),
        }));
      },

      addPhoto: (taskId, photo) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  photos: [...t.photos, { ...photo, id: `photo-${Date.now()}` }],
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
          lastSynced: new Date().toISOString(),
        }));
      },

      removePhoto: (taskId, photoId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  photos: t.photos.filter((p) => p.id !== photoId),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
          lastSynced: new Date().toISOString(),
        }));
      },

      updateTask: (taskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t
          ),
          lastSynced: new Date().toISOString(),
        }));
      },

      getProgressStats: () => {
        const tasks = get().getVisibleTasks();
        const total = tasks.length;
        const done = tasks.filter((t) => t.status === 'done').length;
        const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
        const review = tasks.filter((t) => t.status === 'review').length;
        const todo = tasks.filter((t) => t.status === 'todo').length;
        const overdue = tasks.filter((t) => get().isOverdue(t)).length;
        const noPhotos = tasks.filter(
          (t) => t.status !== 'done' && (!t.photos || t.photos.length === 0)
        ).length;
        const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

        return { total, done, inProgress, review, todo, overdue, noPhotos, percentage };
      },

      getRiskStats: () => {
        const tasks = get().getVisibleTasks();
        return {
          none: tasks.filter((t) => t.riskLevel === 'none').length,
          low: tasks.filter((t) => t.riskLevel === 'low').length,
          medium: tasks.filter((t) => t.riskLevel === 'medium').length,
          high: tasks.filter((t) => t.riskLevel === 'high').length,
          critical: tasks.filter((t) => t.riskLevel === 'critical').length,
        };
      },

      resetToSeed: () => {
        set({
          tasks: SEED_TASKS,
          lastSynced: new Date().toISOString(),
        });
      },

      setOffline: (offline) => set({ isOffline: offline }),
    }),
    {
      name: 'exhibition-task-storage',
      version: 1,
      partialize: (state) => ({
        tasks: state.tasks,
        currentUserId: state.currentUserId,
        filters: state.filters,
        lastSynced: state.lastSynced,
      }),
    }
  )
);
