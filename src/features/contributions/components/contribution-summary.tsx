import * as React from 'react';
import { MonthlyContributionSummary } from '../types';
import { formatCurrencyIDR } from '@/lib/formatting';
import { TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';

export interface ContributionSummaryProps {
  summary: MonthlyContributionSummary;
}

export function ContributionSummary({ summary }: ContributionSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Tertagih</span>
          <TrendingUp className="w-4 h-4 text-blue-500" />
        </div>
        <p className="text-2xl font-black text-slate-900 dark:text-white">
          {formatCurrencyIDR(summary.totalBilled)}
        </p>
        <p className="text-xs text-slate-400">Periode {summary.periodLabel}</p>
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Telah Terkumpul</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
          {formatCurrencyIDR(summary.totalCollected)}
        </p>
        <p className="text-xs text-slate-400">
          Efektivitas Penarikan: <strong>{summary.collectionRatePercent}%</strong>
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Belum Lunas / Tertunda</span>
          <AlertCircle className="w-4 h-4 text-amber-500" />
        </div>
        <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
          {formatCurrencyIDR(summary.totalPending)}
        </p>
        <p className="text-xs text-slate-400">Menunggu konfirmasi atau jatuh tempo</p>
      </div>
    </div>
  );
}
