import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/queries/query-keys';
import { AspirationForm } from '@/features/layanan/aspiration-form';
import { AspirasiFormInput } from '@/lib/validation';
import { formatDateID } from '@/lib/formatting';
import { MessageSquare, Plus, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/layanan/aspirasi')({
  component: AspirasiPage,
});

export interface AspirationItem {
  id: string;
  nomorTiket: string;
  judul: string;
  deskripsi: string;
  kategori: string;
  status: string;
  createdAt: string | Date;
  resolutionNotes?: string;
}

function AspirasiPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);

  const { data: aspirations = [] } = useQuery<AspirationItem[]>({
    queryKey: queryKeys.aspirasi.lists(),
    queryFn: async () => {
      const res = await fetch('/api/aspirasi');
      if (!res.ok) {
        return [
          {
            id: 'asp-1',
            nomorTiket: 'ASP/2026/0014',
            judul: 'Usulan penambahan lampu sensor di gang Blok C',
            deskripsi: 'Di ujung gang Blok C penerangan masih remang saat malam.',
            kategori: 'INFRASTRUKTUR',
            status: 'IN_PROGRESS',
            createdAt: new Date(),
          },
          {
            id: 'asp-2',
            nomorTiket: 'ASP/2026/0012',
            judul: 'Jadwal kerja bakti membersihkan saluran air menjelang hujan',
            deskripsi: 'Mohon dijadwalkan kerja bakti saluran got sebelum musim penghujan.',
            kategori: 'KEBERSIHAN',
            status: 'RESOLVED',
            createdAt: new Date(),
          },
        ];
      }
      const json = await res.json();
      return json.items || [];
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (values: AspirasiFormInput) => {
      const res = await fetch('/api/aspirasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Gagal mengirim aspirasi');
      return await res.json();
    },
    onSuccess: () => {
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.aspirasi.all });
      alert('Aspirasi Anda berhasil dikirim ke pengurus RT.');
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Kanal Aspirasi & Keluhan Warga</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Suara & Aspirasi Warga RT 04
          </h1>
          <p className="text-xs text-slate-500">
            Sampaikan masukan, aduan sarana, atau saran perbaikan untuk kemajuan lingkungan bersama.
          </p>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Lihat Daftar Aspirasi' : 'Sampaikan Aspirasi Baru'}</span>
        </Button>
      </div>

      {showForm ? (
        <AspirationForm
          onSubmit={async (val) => {
            await submitMutation.mutateAsync(val);
          }}
          isLoading={submitMutation.isPending}
        />
      ) : (
        <div className="space-y-4">
          {aspirations.map((a: AspirationItem) => {
            const isResolved = a.status === 'RESOLVED' || a.status === 'CLOSED';
            return (
              <div
                key={a.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {a.nomorTiket}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
                      {a.kategori}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      isResolved
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {isResolved ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    <span>{a.status}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {a.judul}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {a.deskripsi}
                  </p>
                </div>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                  <span>Diajukan pada {formatDateID(a.createdAt, true)}</span>
                  {a.resolutionNotes && (
                    <span className="text-slate-600 dark:text-slate-300 italic">
                      Respon: {a.resolutionNotes}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
