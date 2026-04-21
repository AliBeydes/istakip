'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { initialize, isAuthenticated } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [initialize]);

  const value = {
    isInitializing,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// Protected Route Component
export function ProtectedRoute({ children, fallback = null }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { isInitializing } = useAuthContext();

  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || <div>Please login to access this page.</div>;
  }

  return children;
}

// Public Route Component (redirect if authenticated)
export function PublicRoute({ children, fallback = null }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { isInitializing } = useAuthContext();

  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return fallback || <div>Redirecting to dashboard...</div>;
  }

  return children;
}
