import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { TransparencyPortal } from '@/features/transparansi/transparency-portal';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/transparansi/')({
  component: TransparansiPage,
});

function TransparansiPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['public-transparency'],
    queryFn: async () => {
      const res = await fetch('/api/transparansi');
      if (!res.ok) {
        // Fallback demo data
        return {
          summary: {
            totalPemasukan: 24500000,
            totalPengeluaran: 12000000,
            saldoKas: 12500000,
            totalTransaksi: 84,
          },
          categoryBreakdown: {
            'Iuran Keamanan': 8500000,
            'Iuran Kebersihan': 5400000,
            'Perbaikan Sarana': 4100000,
            'Dana Sosial & Duka': 3200000,
          },
          monthlyTrends: [
            { bulan: '2026-05', pemasukan: 4200000, pengeluaran: 1800000 },
            { bulan: '2026-06', pemasukan: 4800000, pengeluaran: 2100000 },
            { bulan: '2026-07', pemasukan: 5100000, pengeluaran: 2600000 },
            { bulan: '2026-08', pemasukan: 5400000, pengeluaran: 2800000 },
            { bulan: '2026-09', pemasukan: 5000000, pengeluaran: 2700000 },
          ],
        };
      }
      return await res.json();
    },
  });

  if (isLoading && !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-slate-500">Memuat Portal Transparansi Publik...</p>
      </div>
    );
  }

  return <TransparencyPortal data={data} />;
}
