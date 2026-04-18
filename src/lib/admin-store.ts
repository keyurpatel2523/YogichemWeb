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
  token: string | null;
  _hydrated: boolean;
  setAdmin: (admin: AdminUser, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  setHydrated: () => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      _hydrated: false,
      setAdmin: (admin, token) => {
        set({ admin, token });
      },
      logout: () => {
        set({ admin: null, token: null });
      },
      isAuthenticated: () => get().token !== null,
      setHydrated: () => set({ _hydrated: true }),
    }),
    {
      name: 'admin-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
