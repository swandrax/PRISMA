import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/queries/query-keys';
import { announcementSchema } from '@/lib/validation';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BellRing, Send, Loader2 } from 'lucide-react';
import { formatDateID } from '@/lib/formatting';

export const Route = createFileRoute('/admin/pengumuman')({
  component: PengumumanManagementPage,
});

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  targetAudience: string;
  publishedAt: string | Date;
}

function PengumumanManagementPage() {
  const queryClient = useQueryClient();

  const { data: announcements = [] } = useQuery<AnnouncementItem[]>({
    queryKey: queryKeys.pengumuman.list(),
    queryFn: async () => {
      const res = await fetch('/api/admin/announcements');
      if (!res.ok) return [];
      return await res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: unknown) => {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Gagal menerbitkan pengumuman');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pengumuman.all });
      alert('Pengumuman berhasil diterbitkan dan disiarkan ke warga.');
    },
  });

  const form = useForm({
    defaultValues: {
      title: '',
      content: '',
      targetAudience: 'ALL' as 'ALL' | 'RT_WIDE' | 'BLOK' | 'PENGURUS',
      targetBlock: '',
      channels: ['WEB', 'TELEGRAM'],
      isPinned: false,
      scheduledAt: '',
    },
    onSubmit: async ({ value }) => {
      const parsed = announcementSchema.safeParse(value);
      if (!parsed.success) {
        alert(parsed.error.issues[0]?.message || 'Data pengumuman tidak valid');
        return;
      }
      await createMutation.mutateAsync(parsed.data);
      form.reset();
    },
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
          <BellRing className="w-3.5 h-3.5" />
          <span>Siaran Informasi & Woro-woro</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Pusat Pengumuman Warga
        </h1>
        <p className="text-xs text-slate-500">
          Publikasikan maklumat, jadwal kegiatan, dan informasi darurat ke portal web warga dan notifikasi Telegram RT.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Create Announcement */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Terbitkan Siaran Baru
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.Field name="title">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Judul Siaran</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Contoh: Kerja Bakti Massal Menyambut HUT RI"
                    className="rounded-xl"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="targetAudience">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Target Audiens</Label>
                  <select
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value as 'ALL' | 'RT_WIDE' | 'BLOK' | 'PENGURUS')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  >
                    <option value="ALL">Semua Warga & Pengurus</option>
                    <option value="RT_WIDE">Khusus Warga RT 04</option>
                    <option value="BLOK">Warga Blok Tertentu</option>
                    <option value="PENGURUS">Khusus Pengurus / Staf RT</option>
                  </select>
                </div>
              )}
            </form.Field>

            <form.Field name="content">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Isi Pengumuman</Label>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Tuliskan detail jadwal, lokasi kumpul, dan perlengkapan..."
                    className="rounded-xl min-h-[120px]"
                  />
                </div>
              )}
            </form.Field>

            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full gap-2 rounded-xl"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Siarkan Pengumuman</span>
            </Button>
          </form>
        </div>

        {/* Announcement History List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Riwayat Siaran Terbit
          </h2>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                Belum ada riwayat pengumuman
              </div>
            ) : (
              announcements.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                      Target: {item.targetAudience}
                    </span>
                    <span className="text-slate-400">{formatDateID(item.publishedAt, true)}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                    {item.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
