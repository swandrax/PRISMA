import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/queries/query-keys';
import { maskNIK, maskNoKK, formatDateID } from '@/lib/formatting';
import { User, ShieldCheck, ArrowLeft, CreditCard, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/warga/$id')({
  component: WargaDetailPage,
});

function WargaDetailPage() {
  const { id } = Route.useParams();

  const { data: warga, isLoading } = useQuery({
    queryKey: queryKeys.warga.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/warga/${id}`);
      if (!res.ok) throw new Error('Warga tidak ditemukan');
      return await res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!warga) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Data warga tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-8">
      <Link to="/warga" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary">
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Daftar Warga</span>
      </Link>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
              {warga.nama[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {warga.nama}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{warga.status}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                PRISMA ID: <strong className="font-mono text-primary">{warga.residentVerification?.prismaId || 'PRISMA-0409-AUTO'}</strong>
              </p>
            </div>
          </div>

          <Link to="/warga/card">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
              <CreditCard className="w-4 h-4" />
              Lihat Kartu Digital
            </Button>
          </Link>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 uppercase tracking-wider">NIK</div>
            <div className="font-mono font-medium text-slate-900 dark:text-white">{maskNIK(warga.nik)}</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Nomor Kartu Keluarga</div>
            <div className="font-mono font-medium text-slate-900 dark:text-white">{maskNoKK(warga.noKK)}</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Tempat & Tanggal Lahir</div>
            <div className="font-medium text-slate-900 dark:text-white">
              {warga.tempatLahir || '-'}, {formatDateID(warga.tanggalLahir)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Jenis Kelamin</div>
            <div className="font-medium text-slate-900 dark:text-white">
              {warga.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Alamat Lengkap</div>
            <div className="font-medium text-slate-900 dark:text-white">
              {warga.alamat} • Blok {warga.blok} No. {warga.noRumah}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Status Keluarga</div>
            <div className="font-medium text-slate-900 dark:text-white">{warga.statusKeluarga || 'Kepala Keluarga'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
