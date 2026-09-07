// c:\Users\user\Desktop\prisma\src\stores\chat.store.ts
import { create } from 'zustand';

export type AgentStatus = 'idle' | 'routing' | 'thinking' | 'responding' | 'error';

export interface ChatUIState {
  isOpen: boolean;
  isMinimized: boolean;
  activeConversation: string | null;
  selectedQuickAction: string | null;
  inputDraft: string;
  unreadCount: number;
  agentStatus: AgentStatus;

  // Actions
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setIsMinimized: (minimized: boolean) => void;
  toggleMinimized: () => void;
  setActiveConversation: (id: string | null) => void;
  setSelectedQuickAction: (action: string | null) => void;
  setInputDraft: (draft: string) => void;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  resetUnreadCount: () => void;
  setAgentStatus: (status: AgentStatus) => void;
  resetDraft: () => void;
}

export const useChatStore = create<ChatUIState>()((set) => ({
  isOpen: false,
  isMinimized: false,
  activeConversation: 'session-default',
  selectedQuickAction: null,
  inputDraft: '',
  unreadCount: 0,
  agentStatus: 'idle',

  setIsOpen: (isOpen) =>
    set((state) => ({
      isOpen,
      unreadCount: isOpen ? 0 : state.unreadCount,
      isMinimized: isOpen ? false : state.isMinimized,
    })),

  toggleOpen: () =>
    set((state) => {
      const nextOpen = !state.isOpen;
      return {
        isOpen: nextOpen,
        unreadCount: nextOpen ? 0 : state.unreadCount,
        isMinimized: nextOpen ? false : state.isMinimized,
      };
    }),

  setIsMinimized: (isMinimized) => set({ isMinimized }),

  toggleMinimized: () => set((state) => ({ isMinimized: !state.isMinimized })),

  setActiveConversation: (activeConversation) => set({ activeConversation }),

  setSelectedQuickAction: (selectedQuickAction) => set({ selectedQuickAction }),

  setInputDraft: (inputDraft) => set({ inputDraft }),

  setUnreadCount: (unreadCount) => set({ unreadCount }),

  incrementUnreadCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),

  resetUnreadCount: () => set({ unreadCount: 0 }),

  setAgentStatus: (agentStatus) => set({ agentStatus }),

  resetDraft: () => set({ inputDraft: '', selectedQuickAction: null }),
}));
