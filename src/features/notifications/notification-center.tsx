import * as React from 'react';
import { useNotificationStore } from '@/stores/notification.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/queries/query-keys';
import { Bell, X, Check, FileText, DollarSign, ShieldAlert, Info, ExternalLink } from 'lucide-react';
import { formatDateID } from '@/lib/formatting';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string | Date;
  link?: string;
}

export function NotificationCenterDrawer() {
  const { isDrawerOpen, setDrawerOpen, selectedCategory, setSelectedCategory } = useNotificationStore();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<NotificationItem[]>({
    queryKey: queryKeys.notifications.feed(),
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) return [];
      const data = await res.json();
      return data.notifications || [];
    },
    enabled: isDrawerOpen,
  });

  const markAllMutation = useMutation({
    mutationFn: async () => {
      await fetch('/api/notifications/mark-read', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });

  if (!isDrawerOpen) return null;

  const categories = ['ALL', 'SURAT', 'IURAN', 'KEAMANAN', 'PENGUMUMAN', 'SISTEM'];

  const filteredNotifications = notifications.filter((item: NotificationItem) => {
    if (selectedCategory === 'ALL') return true;
    return item.type === selectedCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SURAT':
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'IURAN':
        return <DollarSign className="w-4 h-4 text-amber-500" />;
      case 'KEAMANAN':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Pusat Notifikasi
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => markAllMutation.mutate()}
                title="Tandai semua dibaca"
                className="p-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Baca Semua</span>
              </button>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-slate-400">Memuat notifikasi...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                Tidak ada notifikasi saat ini
              </div>
            ) : (
              filteredNotifications.map((n: NotificationItem) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border transition-all ${
                    n.isRead
                      ? 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60 opacity-80'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0">
                      {getTypeIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {formatDateID(n.createdAt, true)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                        {n.message}
                      </p>
                      {n.link && (
                        <a
                          href={n.link}
                          onClick={() => setDrawerOpen(false)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline mt-2"
                        >
                          <span>Lihat Detail</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
