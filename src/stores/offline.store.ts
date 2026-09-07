import { create } from 'zustand';

interface OfflineStoreState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: Date | null;
  recentSyncLogs: Array<{ id: string; entity: string; status: 'SUCCESS' | 'FAILED'; time: Date }>;
  
  setOnline: (online: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setPendingCount: (count: number) => void;
  setLastSyncAt: (date: Date) => void;
  addSyncLog: (log: { id: string; entity: string; status: 'SUCCESS' | 'FAILED' }) => void;
}

export const useOfflineStore = create<OfflineStoreState>()((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  pendingCount: 0,
  lastSyncAt: null,
  recentSyncLogs: [],

  setOnline: (isOnline) => set({ isOnline }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
  addSyncLog: (log) =>
    set((s) => ({
      recentSyncLogs: [{ ...log, time: new Date() }, ...s.recentSyncLogs.slice(0, 9)],
    })),
}));
