import * as React from 'react';
import { formatCurrencyIDR } from '@/lib/formatting';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ShieldCheck, TrendingUp, TrendingDown, Wallet, CheckCircle2 } from 'lucide-react';

export interface TransparencyPortalProps {
  data: {
    summary: {
      totalPemasukan: number;
      totalPengeluaran: number;
      saldoKas: number;
      totalTransaksi: number;
    };
    categoryBreakdown: Record<string, number>;
    monthlyTrends: Array<{ bulan: string; pemasukan: number; pengeluaran: number }>;
  };
}

export function TransparencyPortal({ data }: TransparencyPortalProps) {
  const { summary, categoryBreakdown, monthlyTrends } = data;

  const chartData = monthlyTrends.map((t) => ({
    name: t.bulan,
    Pemasukan: t.pemasukan,
    Pengeluaran: t.pengeluaran,
  }));

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-8">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Portal Transparansi Publik RT 04 / RW 09</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Akuntabilitas & Keterbukaan Komunitas
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Informasi real-time pengelolaan kas RT, program kerja tahunan, serta rekapitulasi pelayanan warga yang aman dan terverifikasi secara terbuka.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Saldo Kas RT Terkini</span>
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {formatCurrencyIDR(summary.saldoKas)}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Kondisi keuangan aman & seimbang</span>
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Pemasukan Kumulatif</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrencyIDR(summary.totalPemasukan)}
          </div>
          <p className="text-xs text-slate-500">Iuran warga, donasi, kas RT</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Pengeluaran Operasional</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400">
            {formatCurrencyIDR(summary.totalPengeluaran)}
          </div>
          <p className="text-xs text-slate-500">Keamanan, sampah, sarana umum</p>
        </div>
      </div>

      {/* Monthly Financial Trend Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Grafik Pemasukan vs Pengeluaran Bulanan
          </h2>
          <p className="text-xs text-slate-500">Rekapitulasi transaksi per periode</p>
        </div>
        <div className="h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `Rp${v / 1000}k`} />
                <Tooltip formatter={(value: unknown) => formatCurrencyIDR(Number(value))} />
                <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-slate-400">
              Belum ada data transaksi bulanan
            </div>
          )}
        </div>
      </div>

      {/* Program Kerja & Alokasi Anggaran */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Alokasi Pengeluaran Berdasarkan Kategori
          </h3>
          <div className="space-y-3">
            {Object.entries(categoryBreakdown).map(([cat, amount]) => (
              <div key={cat} className="flex items-center justify-between text-sm py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{cat}</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrencyIDR(amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Program Kerja Prioritas Tahun 2026
          </h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <div className="font-semibold text-slate-900 dark:text-white">1. Optimalisasi CCTV & Portal Digital</div>
              <p className="text-xs text-slate-500 mt-1">Pemasangan titik kamera baru di Blok B & C serta integrasi streaming aman.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <div className="font-semibold text-slate-900 dark:text-white">2. Bank Sampah & Pengelolaan Kebersihan</div>
              <p className="text-xs text-slate-500 mt-1">Pilah sampah mandiri dan jadwal pengangkutan teratur setiap 2 hari.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <div className="font-semibold text-slate-900 dark:text-white">3. Program Kartu Warga Digital (PRISMA ID)</div>
              <p className="text-xs text-slate-500 mt-1">Pemberian identitas digital resmi dengan QR code verifikasi untuk seluruh KK.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
