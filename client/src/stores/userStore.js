import { create } from 'zustand';
import { api } from './authStore';

export const useUserStore = create((set, get) => ({
  // State
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  workspaceRoles: {},

  // Actions
  fetchWorkspaceUsers: async (workspaceId) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.get(`/users/workspace/${workspaceId}`);
      const { users } = response.data;
      
      set({
        users,
        loading: false,
        error: null
      });
      
      return users;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch users';
      set({
        loading: false,
        error: errorMessage
      });
      return [];
    }
  },

  inviteUser: async (workspaceId, email, role = 'MEMBER') => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.post(`/users/workspace/${workspaceId}/invite`, {
        email,
        role
      });
      
      // Refresh user list
      await get().fetchWorkspaceUsers(workspaceId);
      
      set({ loading: false, error: null });
      return { success: true, membership: response.data.membership };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to invite user';
      set({
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  inviteUserWithDetails: async (workspaceId, formData) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.post(`/users/workspace/${workspaceId}/invite`, formData);
      
      // Refresh user list
      await get().fetchWorkspaceUsers(workspaceId);
      
      set({ loading: false, error: null });
      
      if (response.data.tempPassword) {
        alert(`Kullanıcı oluşturuldu! Geçici şifre: ${response.data.tempPassword}`);
      }
      
      return { success: true, membership: response.data.membership };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Davet gönderilemedi';
      set({
        loading: false,
        error: errorMessage
      });
      alert('Hata: ' + errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  updateUserRole: async (workspaceId, userId, role) => {
    try {
      set({ loading: true, error: null });
      
      console.log('🔄 Client: Updating role:', { workspaceId, userId, role });
      
      const response = await api.put(`/users/workspace/${workspaceId}/${userId}/role`, {
        role
      });
      
      console.log('✅ Client: Role update response:', response.data);
      
      // Update local state
      set(state => ({
        users: state.users.map(user => 
          user.id === userId ? { ...user, role } : user
        ),
        loading: false,
        error: null
      }));
      
      return { success: true, membership: response.data.membership };
    } catch (error) {
      console.error('❌ Client: Role update failed:', error);
      console.error('❌ Client: Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || 'Failed to update role';
      set({
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  removeUserFromWorkspace: async (workspaceId, userId) => {
    try {
      set({ loading: true, error: null });
      
      await api.delete(`/users/workspace/${workspaceId}/${userId}`);
      
      // Update local state
      set(state => ({
        users: state.users.filter(user => user.id !== userId),
        loading: false,
        error: null
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to remove user';
      set({
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  updateProfile: async (userData) => {
    try {
      set({ loading: true, error: null });
      
      const response = await api.put('/users/profile', userData);
      
      set({
        currentUser: response.data.user,
        loading: false,
        error: null
      });
      
      return { success: true, user: response.data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      set({
        loading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
}));
