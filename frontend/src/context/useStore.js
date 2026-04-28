import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
      // sessionStorage es por-pestaña: evita que cerrar una pestaña
      // dispare un storage event que cierre la sesión en otras pestañas.
      // Al duplicar una pestaña el navegador copia el sessionStorage → sesión activa en ambas.
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user, theme: state.theme }),
    }
  )
);
