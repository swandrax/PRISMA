import * as React from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { LaporKeamananForm } from '@/features/keamanan/lapor-form';
import { LaporanKeamananInput } from '@/lib/validation';
import { useOfflineStore } from '@/stores/offline.store';
import { enqueueMutation } from '@/lib/offline/idb-queue';
import { ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/keamanan/lapor')({
  component: LaporKeamananPage,
});

function LaporKeamananPage() {
  const navigate = useNavigate();
  const isOnline = useOfflineStore((s) => s.isOnline);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (values: LaporanKeamananInput) => {
    setIsSubmitting(true);
    try {
      if (!isOnline) {
        // Queue safely into IndexedDB
        const clientMutationId = `mut_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        await enqueueMutation({
          id: clientMutationId,
          entity: 'LAPORAN_KEAMANAN',
          action: 'CREATE',
          endpoint: '/api/keamanan',
          payload: values as any,
        });

        useOfflineStore.getState().setPendingCount(useOfflineStore.getState().pendingCount + 1);
        alert('Anda sedang offline. Laporan disimpan di perangkat dan akan dikirim otomatis saat koneksi pulih.');
        navigate({ to: '/keamanan' as any });
        return;
      }

      const res = await fetch('/api/keamanan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error('Gagal mengirim laporan');
      alert('Laporan keamanan berhasil dikirim ke pengurus RT.');
      navigate({ to: '/keamanan' as any });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4 py-8">
      <Link to="/keamanan" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary">
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Daftar Laporan</span>
      </Link>

      <LaporKeamananForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
