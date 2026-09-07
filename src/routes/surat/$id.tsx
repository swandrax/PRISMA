import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/queries/query-keys';
import { LetterLifecycleStepper } from '@/features/surat/letter-lifecycle-stepper';
import { formatDateID } from '@/lib/formatting';
import { ArrowLeft, Check, X, AlertCircle, Download, Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';

export const Route = createFileRoute('/surat/$id')({
  component: SuratDetailPage,
});

function SuratDetailPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const { data: surat, isLoading } = useQuery({
    queryKey: queryKeys.surat.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/surat/${id}`);
      if (!res.ok) throw new Error('Surat tidak ditemukan');
      return await res.json();
    },
  });

  const stepMutation = useMutation({
    mutationFn: async (payload: { step: string; status: string; notes?: string }) => {
      const res = await fetch(`/api/surat/${id}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Gagal memproses tahap surat');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.surat.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.surat.all });
    },
  });

  if (isLoading || !surat) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isStaff = user && ['ADMIN', 'PENGURUS', 'KETUA_RT', 'SEKRETARIS', 'SUPER_ADMIN'].includes(user.role);

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-8">
      <Link to="/surat" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary">
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Daftar Surat</span>
      </Link>

      {/* Stepper Component */}
      <LetterLifecycleStepper
        currentStatus={surat.status}
        approvals={surat.approvals || []}
        nomorSurat={surat.nomorSurat}
      />

      {/* Detail Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{surat.jenisSurat}</h2>
          <p className="text-xs text-slate-500">
            Pemohon: <strong className="text-slate-700 dark:text-slate-300">{surat.warga?.nama || 'Warga'}</strong> • Diajukan pada {formatDateID(surat.tanggalPengajuan, true)}
          </p>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">Keperluan Permohonan</div>
            <p className="text-slate-800 dark:text-slate-200 mt-1">{surat.keperluan}</p>
          </div>

          {surat.catatan && (
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Catatan Tambahan</div>
              <p className="text-slate-600 dark:text-slate-300 mt-1">{surat.catatan}</p>
            </div>
          )}
        </div>

        {/* Action Controls for Staff */}
        {isStaff && surat.status !== 'COMPLETED' && surat.status !== 'DITOLAK' && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tindakan Petugas RT
            </h4>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() =>
                  stepMutation.mutate({
                    step: surat.status === 'SUBMITTED' ? 'VERIFICATION' : 'APPROVAL',
                    status: 'APPROVED',
                    notes: 'Berkas telah diverifikasi lengkap dan valid.',
                  })
                }
                disabled={stepMutation.isPending}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              >
                <Check className="w-4 h-4" />
                <span>Setujui Tahap Berikutnya</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const reason = prompt('Masukkan alasan permintaan perbaikan/revisi:');
                  if (reason) {
                    stepMutation.mutate({
                      step: 'REVISION',
                      status: 'REVISION_REQUESTED',
                      notes: reason,
                    });
                  }
                }}
                disabled={stepMutation.isPending}
                className="gap-1.5 text-amber-600 border-amber-300 hover:bg-amber-50 rounded-xl"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Minta Revisi Berkas</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const reason = prompt('Masukkan alasan penolakan:');
                  if (reason) {
                    stepMutation.mutate({
                      step: 'REJECTION',
                      status: 'REJECTED',
                      notes: reason,
                    });
                  }
                }}
                disabled={stepMutation.isPending}
                className="gap-1.5 text-rose-600 border-rose-300 hover:bg-rose-50 rounded-xl"
              >
                <X className="w-4 h-4" />
                <span>Tolak Permohonan</span>
              </Button>
            </div>
          </div>
        )}

        {/* Download PDF button if completed */}
        {(surat.status === 'COMPLETED' || surat.status === 'SELESAI') && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="text-xs text-emerald-600 font-semibold">
              ✓ Dokumen telah ditandatangani secara digital & sah digunakan.
            </div>
            <Button
              onClick={() => window.print()}
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Download PDF</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
