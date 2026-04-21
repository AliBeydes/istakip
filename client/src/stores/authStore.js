import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// API base URL
const API_BASE_URL = 'http://localhost:3020/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add error interceptor for better debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || !error.response) {
      console.error('🚨 Network Error: Sunucuya bağlanılamıyor!', {
        url: error.config?.url,
        baseURL: API_BASE_URL,
        message: error.message,
        code: error.code
      });
    }
    return Promise.reject(error);
  }
);

// Auth store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.post('/auth/login', {
            email,
            password,
          });

          const { user, token } = response.data;
          
          set({
            user: { ...user, token },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true, user: { ...user, token } };
        } catch (error) {
          console.error('Login error:', error);
          let errorMessage = 'Login failed';
          
          if (error.response) {
            errorMessage = error.response.data?.error || error.response.data?.message || 'Server error';
          } else if (error.request) {
            errorMessage = 'Network error - please check your connection';
          } else {
            errorMessage = error.message;
          }
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          
          return { success: false, error: errorMessage };
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.post('/auth/register', userData);
          const { user, token } = response.data;
          
          set({
            user: { ...user, token },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true, user: { ...user, token } };
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Registration failed';
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      getProfile: async () => {
        try {
          set({ isLoading: true });
          
          const response = await api.get('/auth/me');
          const { user } = response.data;
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return user;
        } catch (error) {
          // If token is invalid or expired, logout
          if (error.response?.status === 401) {
            get().logout();
          } else {
            set({
              isLoading: false,
              error: error.response?.data?.error || 'Failed to get profile',
            });
          }
          
          return null;
        }
      },

      updateProfile: async (profileData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.put('/users/profile', profileData);
          const { user } = response.data;
          
          set({
            user,
            isLoading: false,
            error: null,
          });

          return { success: true, user };
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Profile update failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          
          return { success: false, error: errorMessage };
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        try {
          set({ isLoading: true, error: null });
          
          await api.put('/auth/change-password', {
            currentPassword,
            newPassword,
          });
          
          set({
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Password change failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          
          return { success: false, error: errorMessage };
        }
      },

      clearError: () => {
        set({ error: null });
      },

      // Initialize auth state on app load
      initialize: async () => {
        const { isAuthenticated } = get();
        
        if (isAuthenticated) {
          // Verify token is still valid
          await get().getProfile();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // Add Authorization header if token exists in storage
    const storage = localStorage.getItem('auth-storage');
    if (storage) {
      try {
        const { state } = JSON.parse(storage);
        if (state?.user?.token) {
          config.headers.Authorization = `Bearer ${state.user.token}`;
        }
      } catch (e) {
        console.error('Error parsing auth storage:', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, logout user
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export { api };
