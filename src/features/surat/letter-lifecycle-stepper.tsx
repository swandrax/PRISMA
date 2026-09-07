import * as React from 'react';
import { Check, Clock, AlertCircle, FileCheck, PenTool, XCircle } from 'lucide-react';
import { formatDateID } from '@/lib/formatting';

export interface LetterApprovalStep {
  id: string;
  step: string;
  status: string;
  approverNama?: string | null;
  approverRole?: string | null;
  notes?: string | null;
  createdAt: string | Date;
}

export interface LetterLifecycleStepperProps {
  currentStatus: string;
  approvals: LetterApprovalStep[];
  nomorSurat?: string | null;
}

const ORDERED_STEPS = [
  { key: 'SUBMITTED', label: 'Diajukan', icon: Clock },
  { key: 'VERIFICATION', label: 'Verifikasi Berkas', icon: FileCheck },
  { key: 'APPROVAL', label: 'Persetujuan RT', icon: Check },
  { key: 'GENERATING', label: 'Penerbitan Dokumen', icon: FileCheck },
  { key: 'SIGNED', label: 'Penandatanganan', icon: PenTool },
  { key: 'COMPLETED', label: 'Selesai & Sah', icon: Check },
];

export function LetterLifecycleStepper({
  currentStatus,
  approvals,
  nomorSurat,
}: LetterLifecycleStepperProps) {
  const isRejected = currentStatus === 'DITOLAK';
  const isRevision = currentStatus === 'REVISI';

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
      case 'PENDING':
        return 0;
      case 'VERIFICATION':
        return 1;
      case 'APPROVAL':
      case 'DIPROSES':
        return 2;
      case 'GENERATING':
        return 3;
      case 'SIGNED':
        return 4;
      case 'COMPLETED':
      case 'SELESAI':
        return 5;
      default:
        return 0;
    }
  };

  const activeIndex = getStepIndex(currentStatus);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Alur & Tahapan Pemrosesan Surat
          </h3>
          <p className="text-xs text-slate-500">
            Nomor: <strong className="text-slate-700 dark:text-slate-300">{nomorSurat || 'Menunggu Penomoran'}</strong>
          </p>
        </div>

        {isRejected ? (
          <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            Permohonan Ditolak
          </span>
        ) : isRevision ? (
          <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Perlu Perbaikan / Revisi
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            Status: {currentStatus}
          </span>
        )}
      </div>

      {/* Stepper bar */}
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {ORDERED_STEPS.map((step, idx) => {
          const isPassed = idx < activeIndex || currentStatus === 'COMPLETED' || currentStatus === 'SELESAI';
          const isCurrent = idx === activeIndex && !isRejected && !isRevision;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex sm:flex-col items-center gap-3 sm:gap-2 flex-1 relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                  isPassed
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : isCurrent
                    ? 'bg-primary text-white ring-4 ring-primary/20 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {isPassed ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>

              <div className="text-left sm:text-center">
                <div
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? 'text-primary'
                      : isPassed
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Approval history logs */}
      {approvals.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Riwayat Persetujuan & Peninjauan
          </h4>
          <div className="space-y-2">
            {approvals.map((app) => (
              <div
                key={app.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
              >
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {app.step} — {app.status}
                  </span>
                  <span className="text-slate-500 ml-2">
                    oleh {app.approverNama || 'Petugas'} ({app.approverRole || 'Staff'})
                  </span>
                  {app.notes && (
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 italic">
                      &quot;{app.notes}&quot;
                    </p>
                  )}
                </div>
                <span className="text-slate-400 whitespace-nowrap">
                  {formatDateID(app.createdAt, true)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
