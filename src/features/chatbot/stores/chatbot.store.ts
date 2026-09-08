import { create } from 'zustand';
import { AgentStatus } from '../types';

export interface ChatbotUIState {
  isOpen: boolean;
  isMinimized: boolean;
  unreadCount: number;
  agentStatus: AgentStatus;
  inputDraft: string;
  selectedQuickAction: string | null;

  // Actions
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setIsMinimized: (minimized: boolean) => void;
  toggleMinimized: () => void;
  setAgentStatus: (status: AgentStatus) => void;
  setInputDraft: (draft: string) => void;
  resetDraft: () => void;
  setSelectedQuickAction: (id: string | null) => void;
  incrementUnread: () => void;
  resetUnread: () => void;
}

export const useChatbotStore = create<ChatbotUIState>((set) => ({
  isOpen: false,
  isMinimized: false,
  unreadCount: 0,
  agentStatus: 'idle',
  inputDraft: '',
  selectedQuickAction: null,

  setIsOpen: (isOpen) =>
    set((state) => ({
      isOpen,
      unreadCount: isOpen ? 0 : state.unreadCount,
    })),

  toggleOpen: () =>
    set((state) => ({
      isOpen: !state.isOpen,
      unreadCount: !state.isOpen ? 0 : state.unreadCount,
      isMinimized: !state.isOpen ? false : state.isMinimized,
    })),

  setIsMinimized: (isMinimized) => set({ isMinimized }),

  toggleMinimized: () => set((state) => ({ isMinimized: !state.isMinimized })),

  setAgentStatus: (agentStatus) => set({ agentStatus }),

  setInputDraft: (inputDraft) => set({ inputDraft }),

  resetDraft: () => set({ inputDraft: '', selectedQuickAction: null }),

  setSelectedQuickAction: (selectedQuickAction) => set({ selectedQuickAction }),

  incrementUnread: () =>
    set((state) => ({
      unreadCount: state.isOpen ? 0 : state.unreadCount + 1,
    })),

  resetUnread: () => set({ unreadCount: 0 }),
}));
