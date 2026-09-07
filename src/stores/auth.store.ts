import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppRole, AppPermission } from '@/lib/constants';

export interface ClientUser {
  id: string;
  email: string;
  nama: string;
  role: AppRole;
  wargaId?: string;
  nik?: string;
  avatarUrl?: string;
  permissions: AppPermission[];
}

interface AuthStoreState {
  user: ClientUser | null;
  isAuthenticated: boolean;
  activeRoleView: AppRole | null; // Allows multi-role pengurus/admin to view UI as warga
  setUser: (user: ClientUser | null) => void;
  setActiveRoleView: (role: AppRole | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      activeRoleView: null,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          activeRoleView: user ? user.role : null,
        }),
      setActiveRoleView: (role) => set({ activeRoleView: role }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          activeRoleView: null,
        }),
    }),
    {
      name: 'prisma-auth-ui-state',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        activeRoleView: state.activeRoleView,
      }),
    }
  )
);
