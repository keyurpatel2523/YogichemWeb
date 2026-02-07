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
  setAdmin: (admin: AdminUser, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      setAdmin: (admin, token) => {
        set({ admin, token });
        localStorage.setItem('admin_token', token);
      },
      logout: () => {
        set({ admin: null, token: null });
        localStorage.removeItem('admin_token');
      },
      isAuthenticated: () => get().token !== null,
    }),
    { name: 'admin-storage' }
  )
);
