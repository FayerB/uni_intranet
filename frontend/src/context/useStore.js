import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      user: null,
      theme: 'light',

      setUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null });
      },

      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'intranet-store',
      partialize: (state) => ({ user: state.user, theme: state.theme }),
    }
  )
);
