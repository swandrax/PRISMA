import * as React from 'react';
import { formatCurrencyIDR } from '@/lib/formatting';
import { Users, FileText, DollarSign, ShieldAlert, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PengurusDashboardProps {
  stats: {
    totalWarga: number;
    pendingSuratCount: number;
    pendingIuranCount: number;
    pendingSecurityReportsCount: number;
    saldoKas: number;
    collectionRate: number;
  };
  urgentLetters: Array<{
    id: string;
    wargaNama: string;
    jenisSurat: string;
    status: string;
    keperluan: string;
  }>;
  unverifiedPayments: Array<{
    id: string;
    wargaNama: string;
    iuranName: string;
    amount: number;
  }>;
  onQuickApproveLetter?: (id: string) => void;
}

export function PengurusDashboard({
  stats,
  urgentLetters,
  unverifiedPayments,
}: PengurusDashboardProps) {
  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard Pengurus RT 04
          </h1>
          <p className="text-sm text-slate-500">
            Monitoring administrasi warga, permohonan surat, dan kas operasional lingkungan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/admin/pengumuman">
            <Button size="sm" className="gap-2">
              <BellRing className="w-4 h-4" />
              Buat Pengumuman
            </Button>
          </a>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Warga</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.totalWarga}
          </div>
          <a href="/warga" className="text-[11px] text-primary hover:underline block pt-1">
            Lihat data warga →
          </a>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Surat Menunggu</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.pendingSuratCount}
          </div>
          <a href="/surat" className="text-[11px] text-primary hover:underline block pt-1">
            Proses surat →
          </a>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Verifikasi Iuran</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.pendingIuranCount}
          </div>
          <a href="/keuangan/pembayaran" className="text-[11px] text-primary hover:underline block pt-1">
            Cek bukti bayar →
          </a>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Laporan Keamanan</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {stats.pendingSecurityReportsCount}
          </div>
          <a href="/keamanan" className="text-[11px] text-primary hover:underline block pt-1">
            Tangani insiden →
          </a>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Urgent Letters Requiring Attention */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              <span>Antrean Verifikasi Surat</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {urgentLetters.length} Butuh Tindakan
            </span>
          </div>

          <div className="space-y-3">
            {urgentLetters.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">
                Semua surat telah diproses
              </div>
            ) : (
              urgentLetters.map((l) => (
                <div
                  key={l.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {l.wargaNama}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {l.jenisSurat} • {l.keperluan}
                    </div>
                  </div>
                  <a href={`/surat/${l.id}`}>
                    <Button size="sm" variant="outline" className="text-xs shrink-0">
                      Tinjau
                    </Button>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Iuran Proofs */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <span>Verifikasi Bukti Bayar Iuran</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {unverifiedPayments.length} Baru
            </span>
          </div>

          <div className="space-y-3">
            {unverifiedPayments.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">
                Semua pembayaran telah diverifikasi
              </div>
            ) : (
              unverifiedPayments.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {p.wargaNama}
                    </div>
                    <div className="text-xs text-slate-500">
                      {p.iuranName} • {formatCurrencyIDR(p.amount)}
                    </div>
                  </div>
                  <a href="/keuangan/pembayaran">
                    <Button size="sm" variant="outline" className="text-xs">
                      Verifikasi
                    </Button>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
