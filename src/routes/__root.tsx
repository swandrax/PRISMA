import * as React from 'react';
import { createRootRoute, Outlet, Link } from '@tanstack/react-router';
import { QueryProvider } from '@/queries/query-provider';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CommandPalette } from '@/components/navigation/command-palette';
import { NotificationCenterDrawer } from '@/features/notifications/notification-center';
import { initOfflineSyncListeners } from '@/lib/offline/sync-engine';
import { useOfflineStore } from '@/stores/offline.store';
import { WifiOff } from 'lucide-react';
import { ChatbotContainer } from '@/components/chat/ChatbotContainer';

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">404</h1>
      <p className="text-sm text-slate-500">Halaman yang Anda cari tidak ditemukan.</p>
      <Link to="/" className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90">
        Kembali ke Beranda
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <h1 className="text-2xl font-bold text-rose-600">Terjadi Kesalahan Sistem</h1>
      <p className="text-xs text-slate-500 max-w-md">{error instanceof Error ? error.message : 'Silakan muat ulang halaman.'}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700"
      >
        Muat Ulang Halaman
      </button>
    </div>
  ),
});

function RootComponent() {
  const isOnline = useOfflineStore((s) => s.isOnline);
  const pendingCount = useOfflineStore((s) => s.pendingCount);

  React.useEffect(() => {
    const cleanup = initOfflineSyncListeners();
    return () => cleanup && cleanup();
  }, []);

  return (
    <QueryProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
        {/* Skip to Content for A11y */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg"
        >
          Lewati ke konten utama
        </a>

        {/* Offline Banner Indicator */}
        {!isOnline && (
          <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-medium flex items-center justify-center gap-2 shadow-sm">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Mode Offline: Aksi Anda akan disimpan secara lokal dan disinkronkan otomatis saat kembali online. {pendingCount > 0 ? `(${pendingCount} antrean)` : ''}</span>
          </div>
        )}

        {/* Navigation Bar */}
        <Navbar />

        {/* Main Content Area */}
        <main id="main-content" role="main" className="flex-1 w-full">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />

        {/* Global Overlays & Modals */}
        <CommandPalette />
        <NotificationCenterDrawer />
        <ChatbotContainer />
      </div>
    </QueryProvider>
  );
}
