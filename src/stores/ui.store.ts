import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ModalType =
  | 'AJUKAN_SURAT'
  | 'LAPOR_KEAMANAN'
  | 'BAYAR_IURAN'
  | 'SUBMIT_ASPIRASI'
  | 'VERIFIKASI_RESIDENT'
  | 'BUAT_PENGUMUMAN'
  | null;

interface UIStoreState {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  activeModal: ModalType;
  modalPayload: Record<string, unknown> | null;
  theme: 'light' | 'dark' | 'system';
  
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebarCollapse: () => void;
  openModal: (type: ModalType, payload?: Record<string, unknown> | null) => void;
  closeModal: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIStoreState>()(
  persist(
    (set) => ({
      isSidebarOpen: false,
      isSidebarCollapsed: false,
      activeModal: null,
      modalPayload: null,
      theme: 'system',

      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      toggleSidebarCollapse: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
      openModal: (type, payload = null) => set({ activeModal: type, modalPayload: payload }),
      closeModal: () => set({ activeModal: null, modalPayload: null }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'prisma-ui-state',
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);
