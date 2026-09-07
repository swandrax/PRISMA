import { create } from 'zustand';

interface NotificationStoreState {
  isDrawerOpen: boolean;
  selectedCategory: string; // 'ALL', 'SURAT', 'IURAN', 'KEAMANAN', 'PENGUMUMAN'
  setDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  setSelectedCategory: (category: string) => void;
}

export const useNotificationStore = create<NotificationStoreState>()((set) => ({
  isDrawerOpen: false,
  selectedCategory: 'ALL',
  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));
