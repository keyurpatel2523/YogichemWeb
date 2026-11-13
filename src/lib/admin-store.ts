import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AdminStore {
  admin: AdminUser | null;
  _hydrated: boolean;
  setAdmin: (admin: AdminUser) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  setHydrated: () => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      admin: null,
      _hydrated: false,
      setAdmin: (admin) => {
        set({ admin });
      },
      logout: () => {
        set({ admin: null });
        void fetch('/api/admin/logout', { method: 'POST' });
      },
      isAuthenticated: () => get().admin !== null,
      setHydrated: () => set({ _hydrated: true }),
    }),
    {
      name: 'admin-storage',
      version: 2,
      partialize: (state) => ({ admin: state.admin }),
      migrate: (persisted) => {
        const state = persisted as { admin?: AdminUser | null } | undefined;
        return { admin: state?.admin ?? null };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
