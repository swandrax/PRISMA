export const queryKeys = {
  // Warga
  warga: {
    all: ['warga'] as const,
    lists: () => [...queryKeys.warga.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.warga.lists(), params] as const,
    details: () => [...queryKeys.warga.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.warga.details(), id] as const,
    card: (id: string) => [...queryKeys.warga.all, 'card', id] as const,
  },

  // Surat
  surat: {
    all: ['surat'] as const,
    lists: () => [...queryKeys.surat.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.surat.lists(), params] as const,
    details: () => [...queryKeys.surat.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.surat.details(), id] as const,
    verifications: () => [...queryKeys.surat.all, 'verify'] as const,
    verify: (code: string) => [...queryKeys.surat.verifications(), code] as const,
  },

  // Keuangan
  keuangan: {
    all: ['keuangan'] as const,
    summary: () => [...queryKeys.keuangan.all, 'summary'] as const,
    transactions: (params?: Record<string, unknown>) => [...queryKeys.keuangan.all, 'transactions', params] as const,
  },

  // Iuran
  iuran: {
    all: ['iuran'] as const,
    categories: () => [...queryKeys.iuran.all, 'categories'] as const,
    bills: (wargaId?: string) => [...queryKeys.iuran.all, 'bills', wargaId] as const,
    unpaid: (wargaId?: string) => [...queryKeys.iuran.all, 'unpaid', wargaId] as const,
    summary: (year?: number) => [...queryKeys.iuran.all, 'summary', year] as const,
  },

  // Keamanan
  keamanan: {
    all: ['keamanan'] as const,
    lists: () => [...queryKeys.keamanan.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.keamanan.lists(), params] as const,
    detail: (id: string) => [...queryKeys.keamanan.all, 'detail', id] as const,
  },

  // Aspirasi
  aspirasi: {
    all: ['aspirasi'] as const,
    lists: () => [...queryKeys.aspirasi.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.aspirasi.lists(), params] as const,
    detail: (id: string) => [...queryKeys.aspirasi.all, 'detail', id] as const,
  },

  // Pengumuman
  pengumuman: {
    all: ['pengumuman'] as const,
    active: () => [...queryKeys.pengumuman.all, 'active'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.pengumuman.all, 'list', params] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
    feed: () => [...queryKeys.notifications.all, 'feed'] as const,
  },

  // Dashboard
  dashboard: {
    warga: (wargaId?: string) => ['dashboard', 'warga', wargaId] as const,
    pengurus: () => ['dashboard', 'pengurus'] as const,
    admin: () => ['dashboard', 'admin'] as const,
  },

  // Audit Logs
  audit: {
    all: ['audit'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.audit.all, 'list', params] as const,
  },

  // Health
  health: () => ['system', 'health'] as const,

  // Chatbot (Mbak PRISMA)
  chat: {
    all: ['chat'] as const,
    conversations: () => [...queryKeys.chat.all, 'conversations'] as const,
    messages: (sessionId: string) => [...queryKeys.chat.all, 'messages', sessionId] as const,
    history: (sessionId: string) => [...queryKeys.chat.all, 'history', sessionId] as const,
  },
};
