import * as React from 'react';
import { formatCurrencyIDR, formatDateID, maskNIK } from '@/lib/formatting';
import { FileText, DollarSign, ShieldAlert, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface WargaDashboardProps {
  user: {
    nama: string;
    nik?: string;
    rt?: string;
    rw?: string;
    blok?: string;
    noRumah?: string;
  };
  letters: Array<{
    id: string;
    nomorSurat?: string | null;
    jenisSurat: string;
    status: string;
    tanggalPengajuan: string | Date;
  }>;
  bills: Array<{
    id: string;
    name: string;
    amount: number;
    bulan: number;
    tahun: number;
    status: string;
  }>;
  recentSecurityReports: Array<{
    id: string;
    judul: string;
    status: string;
    tanggal: string | Date;
  }>;
}

export function WargaDashboard({ user, letters, bills, recentSecurityReports }: WargaDashboardProps) {
  const unpaidBills = bills.filter((b) => b.status === 'UNPAID' || b.status === 'OVERDUE');
  const pendingLetters = letters.filter((l) => l.status !== 'COMPLETED' && l.status !== 'DITOLAK');

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-primary text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-medium backdrop-blur-md">
            <span>Portal Warga RT {user.rt || '04'} / RW {user.rw || '09'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Selamat Datang, {user.nama}
          </h1>
          <p className="text-sm text-blue-100 max-w-xl">
            Alamat: Blok {user.blok || 'A'} No. {user.noRumah || '1'} • NIK: {maskNIK(user.nik)}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 relative z-10">
          <a href="/warga/card">
            <Button variant="secondary" size="sm" className="gap-2 bg-white text-blue-900 hover:bg-white/90">
              <CreditCard className="w-4 h-4" />
              Kartu Warga Digital
            </Button>
          </a>
          <a href="/surat/ajukan">
            <Button variant="outline" size="sm" className="gap-2 border-white/40 text-white hover:bg-white/10">
              <FileText className="w-4 h-4" />
              Ajukan Surat
            </Button>
          </a>
          <a href="/keamanan/lapor">
            <Button variant="outline" size="sm" className="gap-2 border-white/40 text-white hover:bg-white/10">
              <ShieldAlert className="w-4 h-4" />
              Lapor Keamanan
            </Button>
          </a>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Surat Dalam Proses</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {pendingLetters.length}
            </div>
            <a href="/surat" className="text-xs text-primary hover:underline mt-2 inline-block">
              Lihat status surat →
            </a>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Tagihan Iuran Belum Lunas</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {unpaidBills.length}
            </div>
            <a href="/keuangan/iuran" className="text-xs text-primary hover:underline mt-2 inline-block">
              Bayar sekarang →
            </a>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Laporan Keamanan Aktif</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {recentSecurityReports.length}
            </div>
            <a href="/keamanan" className="text-xs text-primary hover:underline mt-2 inline-block">
              Lihat laporan →
            </a>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Letters & Unpaid Bills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Letters Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Pengajuan Surat Terakhir</span>
            </h3>
            <a href="/surat" className="text-xs text-primary hover:underline">
              Semua Surat
            </a>
          </div>

          <div className="space-y-3">
            {letters.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">
                Belum ada permohonan surat
              </div>
            ) : (
              letters.slice(0, 4).map((l) => (
                <div
                  key={l.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {l.jenisSurat}
                    </div>
                    <div className="text-xs text-slate-500">
                      Diajukan: {formatDateID(l.tanggalPengajuan)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {l.status}
                    </span>
                    <a href={`/surat/${l.id}`} className="text-slate-400 hover:text-primary">
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bills Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-500" />
              <span>Tagihan Iuran Warga</span>
            </h3>
            <a href="/keuangan/iuran" className="text-xs text-primary hover:underline">
              Kelola Iuran
            </a>
          </div>

          <div className="space-y-3">
            {bills.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">
                Tidak ada tagihan aktif
              </div>
            ) : (
              bills.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {b.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      Periode {b.bulan}/{b.tahun} • {formatCurrencyIDR(b.amount)}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      b.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
