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
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
          <div className="text-slate-500">Rincian Tagihan:</div>
          <div className="font-semibold text-slate-900 dark:text-white text-sm">
            {bill.name} • Periode {bill.bulan}/{bill.tahun}
          </div>
          <div className="text-primary font-bold text-base">
            {formatCurrencyIDR(bill.amount)}
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
          {/* Payment Method */}
          <form.Field name="paymentMethod">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Metode Pembayaran</Label>
                <select
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as 'TRANSFER_BANK' | 'QRIS' | 'TUNAI')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                >
                  <option value="TRANSFER_BANK">Transfer Bank (BCA / Mandiri / BRI)</option>
                  <option value="QRIS">QRIS Kas RT</option>
                  <option value="TUNAI">Tunai kepada Bendahara</option>
                </select>
              </div>
            )}
          </form.Field>

          {/* Bukti Bayar URL */}
          <form.Field name="buktiBayarUrl">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>URL Bukti Struk / Screenshot</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="https://..."
                  className="rounded-xl"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-rose-500">{String(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          </form.Field>

          {/* Notes */}
          <form.Field name="notes">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Catatan (Opsional)</Label>
                <Input
                  id={field.name}
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Contoh: Transfer dari rek an Budi"
                  className="rounded-xl"
                />
              </div>
            )}
          </form.Field>

          <div className="flex items-center gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">
              Batal
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 rounded-xl gap-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              <span>Kirim Bukti</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
