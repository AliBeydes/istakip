'use client';

import { useAuthStore } from '@/stores/authStore';

export default function AuthDebug() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  return (
    <div className="fixed top-4 right-4 bg-yellow-100 p-4 rounded-lg text-xs max-w-xs z-50">
      <h4 className="font-bold mb-2">Auth State:</h4>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify({
          isAuthenticated,
          isLoading,
          user: user ? {
            id: user.id,
            email: user.email,
            firstName: user.firstName
          } : null
        }, null, 2)}
      </pre>
    </div>
  );
}
