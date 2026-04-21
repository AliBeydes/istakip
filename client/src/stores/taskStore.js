import { create } from 'zustand';
import { api } from './authStore';

export const useTaskStore = create((set, get) => ({
  // State
  tasks: [],
  loading: false,
  error: null,
  filters: {
    status: '',
    priority: '',
    assigneeId: '',
    search: ''
  },

  // Actions
  fetchTasks: async (workspaceId) => {
    try {
      set({ loading: true, error: null });
      
      const params = new URLSearchParams({
        workspaceId,
        ...get().filters
      });
      
      const response = await api.get(`/tasks?${params}`);
      const { tasks } = response.data;
      
      set({
        tasks: tasks || [],
        loading: false,
        error: null
      });
      
      return tasks;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch tasks';
      set({
        loading: false,
        error: errorMessage
      });
      return [];
    }
  },

  createTask: async (taskData) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.post('/tasks', taskData);
      const { task } = response.data;
      
      set(state => ({
        tasks: [task, ...state.tasks],
        loading: false,
        error: null
      }));
      
      return { success: true, task };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create task';
      set({
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  updateTask: async (taskId, updateData) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.put(`/tasks/${taskId}`, updateData);
      const { task } = response.data;
      
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? task : t),
        loading: false,
        error: null
      }));
      
      return { success: true, task };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update task';
      set({
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  deleteTask: async (taskId) => {
    try {
      set({ loading: true, error: null });
      
      await api.delete(`/tasks/${taskId}`);
      
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== taskId),
        loading: false,
        error: null
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete task';
      set({
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  updateTaskStatus: async (taskId, status) => {
    return await get().updateTask(taskId, { status });
  },

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        status: '',
        priority: '',
        assigneeId: '',
        search: ''
      }
    });
  },

  clearError: () => {
    set({ error: null });
  },

  // Get tasks by status for Kanban board
  getTasksByStatus: () => {
    const { tasks = [] } = get();
    
    return {
      TODO: tasks.filter(task => task.status === 'TODO'),
      IN_PROGRESS: tasks.filter(task => task.status === 'IN_PROGRESS'),
      IN_REVIEW: tasks.filter(task => task.status === 'IN_REVIEW'),
      DONE: tasks.filter(task => task.status === 'DONE'),
      CANCELLED: tasks.filter(task => task.status === 'CANCELLED')
    };
  },

  // Get task statistics
  getTaskStats: () => {
    const { tasks = [] } = get();
    
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'DONE').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      todo: tasks.filter(t => t.status === 'TODO').length,
      highPriority: tasks.filter(t => t.priority === 'HIGH' || t.priority === 'URGENT').length,
      overdue: tasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
      ).length
    };
  }
}));
