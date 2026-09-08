import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/queries/query-keys';
import { formatCurrencyIDR } from '@/lib/formatting';
import { DollarSign, UploadCloud, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaymentProofModal } from '@/features/keuangan/iuran/payment-proof-modal';
import { PaymentProofInput } from '@/lib/validation';

export const Route = createFileRoute('/keuangan/iuran')({
  component: IuranPage,
});

export interface IuranBillItem {
  id: string;
  name: string;
  amount: number;
  bulan: number;
  tahun: number;
  status: string;
}

function IuranPage() {
  const queryClient = useQueryClient();
  const [selectedBill, setSelectedBill] = React.useState<IuranBillItem | null>(null);

  const { data: bills = [] } = useQuery<IuranBillItem[]>({
    queryKey: queryKeys.iuran.bills(),
    queryFn: async () => {
      const res = await fetch('/api/iuran/bills');
      if (!res.ok) {
        // Fallback demo billing records
        return [
          {
            id: 'bill-1',
            name: 'Iuran Keamanan RT',
            amount: 50000,
            bulan: 9,
            tahun: 2026,
            status: 'UNPAID',
          },
          {
            id: 'bill-2',
            name: 'Iuran Sampah & Kebersihan',
            amount: 30000,
            bulan: 9,
            tahun: 2026,
            status: 'UNPAID',
          },
          {
            id: 'bill-3',
            name: 'Dana Sosial & Kematian',
            amount: 20000,
            bulan: 8,
            tahun: 2026,
            status: 'PAID',
          },
        ];
      }
      return await res.json();
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (values: PaymentProofInput) => {
      const res = await fetch('/api/iuran/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Gagal mengirim bukti bayar');
      return await res.json();
    },
    onSuccess: () => {
      setSelectedBill(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.iuran.all });
      alert('Bukti pembayaran berhasil diunggah dan menunggu verifikasi Bendahara.');
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-2">
          <DollarSign className="w-3.5 h-3.5" />
          <span>Iuran Wajib & Donasi Warga</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Tagihan & Pembayaran Iuran Warga
        </h1>
        <p className="text-xs text-slate-500">
          Daftar tagihan iuran bulanan lingkungan RT 04 (Keamanan, Kebersihan, Dana Sosial, Infrastruktur).
        </p>
      </div>

      {/* Bill Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bills.map((b: IuranBillItem) => {
          const isPaid = b.status === 'PAID';
          return (
            <div
              key={b.id}
              className={`p-5 rounded-2xl border transition-all ${
                isPaid
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/60'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Periode {b.bulan}/{b.tahun}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                    isPaid
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  <span>{b.status}</span>
                </span>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {b.name}
              </h3>
              <div className="text-xl font-extrabold text-primary my-3">
                {formatCurrencyIDR(b.amount)}
              </div>

              {!isPaid ? (
                <Button
                  onClick={() => setSelectedBill(b)}
                  className="w-full gap-2 rounded-xl"
                  size="sm"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Konfirmasi Pembayaran</span>
                </Button>
              ) : (
                <div className="text-center text-xs text-emerald-600 font-medium py-1.5">
                  ✓ Telah diverifikasi lunas
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <PaymentProofModal
        isOpen={!!selectedBill}
        onClose={() => setSelectedBill(null)}
        bill={selectedBill}
        onSubmit={async (val) => {
          await paymentMutation.mutateAsync(val);
        }}
        isLoading={paymentMutation.isPending}
      />
    </div>
  );
}
