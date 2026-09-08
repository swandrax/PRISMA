import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { paymentProofSchema, PaymentProofInput } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrencyIDR } from '@/lib/formatting';
import { UploadCloud, X, Loader2 } from 'lucide-react';

export interface PaymentProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: {
    id: string;
    name: string;
    amount: number;
    bulan: number;
    tahun: number;
  } | null;
  onSubmit: (values: PaymentProofInput) => Promise<void>;
  isLoading?: boolean;
}

export function PaymentProofModal({
  isOpen,
  onClose,
  bill,
  onSubmit,
  isLoading = false,
}: PaymentProofModalProps) {
  const form = useForm({
    defaultValues: {
      billId: bill?.id || '',
      amount: bill?.amount || 0,
      paymentMethod: 'TRANSFER_BANK' as 'TRANSFER_BANK' | 'QRIS' | 'TUNAI',
      buktiBayarUrl: '',
      notes: '',
    },
    onSubmit: async ({ value }) => {
      const parsed = paymentProofSchema.safeParse(value);
      if (!parsed.success) {
        alert(parsed.error.issues[0]?.message || 'Data pembayaran tidak valid');
        return;
      }
      await onSubmit(parsed.data);
    },
  });

  if (!isOpen || !bill) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Konfirmasi Pembayaran Iuran
          </h3>
          <button onClick={onClose} aria-label="Tutup dialog" className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
          <p className="text-xs text-slate-500">{bill.name}</p>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-semibold">Periode {bill.bulan}/{bill.tahun}</span>
            <span className="text-base font-bold text-emerald-600">{formatCurrencyIDR(bill.amount)}</span>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="paymentMethod">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Metode Pembayaran</Label>
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value as 'TRANSFER_BANK' | 'QRIS' | 'TUNAI')}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                >
                  <option value="TRANSFER_BANK">Transfer Bank (BCA / Mandiri)</option>
                  <option value="QRIS">QRIS Statis RT 04</option>
                  <option value="TUNAI">Tunai ke Bendahara</option>
                </select>
              </div>
            )}
          </form.Field>

          <form.Field name="buktiBayarUrl">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>URL Bukti Transfer / Foto Bukti</Label>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder="https://... atau unggah bukti"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <UploadCloud className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Dapat melampirkan screenshot mutasi transfer atau struk ATM.
                </p>
              </div>
            )}
          </form.Field>

          <form.Field name="notes">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Catatan Tambahan (Opsional)</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Contoh: Transfer atas nama Budi"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Kirim Konfirmasi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
