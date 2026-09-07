import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { formatDateID } from '@/lib/formatting';

export const Route = createFileRoute('/surat/verify/$code')({
  component: DocumentVerificationPage,
});

function DocumentVerificationPage() {
  const { code } = Route.useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['document-verification', code],
    queryFn: async () => {
      const res = await fetch(`/api/verify/${code}`);
      if (!res.ok) throw new Error('Dokumen tidak valid atau tidak ditemukan');
      return await res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-slate-500">Memverifikasi keaslian dokumen...</p>
      </div>
    );
  }

  if (isError || !data || !data.valid) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-rose-200 dark:border-rose-900 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Dokumen Tidak Valid
          </h1>
          <p className="text-xs text-slate-500">
            {data?.error || 'Kode verifikasi dokumen tidak terdaftar pada basis data resmi PRISMA RT 04.'}
          </p>
          <div className="text-[11px] font-mono text-slate-400">Kode: {code}</div>
        </div>
      </div>
    );
  }

  const meta = data.publicMetadata || {};

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-emerald-200 dark:border-emerald-900 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Dokumen Sah & Terverifikasi
          </h1>
          <p className="text-xs text-emerald-600 font-medium">
            Otentikasi Kriptografis Resmi PRISMA RT 04 / RW 09
          </p>
        </div>

        {/* Minimal Safe Proof Attributes */}
        <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500">Kode Dokumen:</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white">{code}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500">Nama Warga Terdaftar:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{meta.nama || '-'}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500">Jenis Dokumen:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{meta.jenisDokumen || 'Surat Pengantar RT'}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500">Wilayah Kependudukan:</span>
            <span className="font-semibold text-slate-900 dark:text-white">RT {meta.rt || '04'} / RW {meta.rw || '09'}</span>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-slate-500">Tanggal Terbit:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{formatDateID(meta.tanggalTerbit)}</span>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-400">
          Halaman ini menampilkan verifikasi publik minimum tanpa mengekspos NIK, nomor telepon, atau data sensitif warga.
        </div>
      </div>
    </div>
  );
}
