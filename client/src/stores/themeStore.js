import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      // State
      theme: 'light', // 'light' | 'dark' | 'system'
      isDark: false,

      // Actions
      setTheme: (newTheme) => {
        const isDarkMode = newTheme === 'dark' || 
          (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        set({ theme: newTheme, isDark: isDarkMode });
        get().applyTheme(isDarkMode);
      },

      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        const isDarkMode = newTheme === 'dark';
        
        set({ theme: newTheme, isDark: isDarkMode });
        get().applyTheme(isDarkMode);
      },

      applyTheme: (isDark) => {
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          
          if (isDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
          
          // Store preference
          localStorage.setItem('theme-preference', isDark ? 'dark' : 'light');
        }
      },

      initTheme: () => {
        if (typeof window === 'undefined') return;
        
        const { theme } = get();
        let isDarkMode = false;

        if (theme === 'dark') {
          isDarkMode = true;
        } else if (theme === 'system') {
          isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        set({ isDark: isDarkMode });
        get().applyTheme(isDarkMode);

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
          if (get().theme === 'system') {
            set({ isDark: e.matches });
            get().applyTheme(e.matches);
          }
        };

        mediaQuery.addEventListener('change', handleChange);
        
        // Cleanup function
        return () => mediaQuery.removeEventListener('change', handleChange);
      },

      // Get current theme colors
      getThemeColors: () => {
        const { isDark } = get();
        return {
          bg: isDark ? 'bg-gray-900' : 'bg-gray-50',
          card: isDark ? 'bg-gray-800' : 'bg-white',
          text: isDark ? 'text-white' : 'text-gray-900',
          textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
          border: isDark ? 'border-gray-700' : 'border-gray-200',
          input: isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300',
          button: isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700',
          buttonSecondary: isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200',
          hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
          shadow: isDark ? 'shadow-gray-900/20' : 'shadow-lg'
        };
      }
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme })
    }
  )
);

export default useThemeStore;
