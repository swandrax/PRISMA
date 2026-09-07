import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth.store';
import { maskNIK } from '@/lib/formatting';
import { Shield, LogOut, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/profil/')({
  component: ProfilPage,
});

function ProfilPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4 py-8">
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
            {user?.nama ? user.nama[0] : 'W'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {user?.nama || 'Warga RT 04'}
            </h1>
            <p className="text-xs text-slate-500">{user?.email || 'warga@prisma.id'}</p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold mt-2">
              <Shield className="w-3 h-3" />
              <span>Peran: {user?.role || 'WARGA'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">NIK:</span>
            <span className="font-mono font-medium text-slate-900 dark:text-white">{maskNIK(user?.nik)}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Status Autentikasi:</span>
            <span className="font-medium text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Terverifikasi Sesi Aktif</span>
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button onClick={handleLogout} variant="outline" className="gap-2 text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl">
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
