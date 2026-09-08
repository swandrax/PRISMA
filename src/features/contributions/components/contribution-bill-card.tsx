import * as React from 'react';
import { ContributionBill } from '../types';
import { formatCurrencyIDR, formatDateID } from '@/lib/formatting';
import { Shield, Sparkles, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ContributionBillCardProps {
  bill: ContributionBill;
  onPay?: (bill: ContributionBill) => void;
}

export function ContributionBillCard({ bill, onPay }: ContributionBillCardProps) {
  const isPaid = bill.status === 'PAID';
  const isOverdue = bill.status === 'OVERDUE';
  const isPendingVerification = bill.payment?.status === 'PENDING';

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600">
            {bill.kategori === 'KEAMANAN' ? (
              <Shield className="w-5 h-5" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {bill.contributionName}
            </h4>
            <p className="text-xs text-slate-500">
              Periode: {bill.bulan}/{bill.tahun}
            </p>
          </div>
        </div>

        {isPaid ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-200 dark:border-emerald-800/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Lunas
          </span>
        ) : isPendingVerification ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-600 border border-amber-200 dark:border-amber-800/30">
            <Clock className="w-3.5 h-3.5" />
            Verifikasi
          </span>
        ) : isOverdue ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/30 text-rose-600 border border-rose-200 dark:border-rose-800/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Jatuh Tempo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Belum Bayar
          </span>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-slate-400">Total Tagihan</p>
          <p className="text-base font-extrabold text-slate-900 dark:text-white">
            {formatCurrencyIDR(bill.amount)}
          </p>
        </div>

        {!isPaid && !isPendingVerification && onPay && (
          <Button
            size="sm"
            onClick={() => onPay(bill)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
          >
            Konfirmasi Bayar
          </Button>
        )}

        {isPaid && bill.payment?.verifiedAt && (
          <span className="text-[11px] text-slate-400">
            Diverifikasi: {formatDateID(bill.payment.verifiedAt)}
          </span>
        )}
      </div>
    </div>
  );
}
