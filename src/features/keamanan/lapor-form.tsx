import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { laporanKeamananSchema, LaporanKeamananInput } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ShieldAlert, Loader2 } from 'lucide-react';

export interface LaporKeamananFormProps {
  onSubmit: (values: LaporanKeamananInput) => Promise<void>;
  isLoading?: boolean;
}

export function LaporKeamananForm({ onSubmit, isLoading = false }: LaporKeamananFormProps) {
  const form = useForm({
    defaultValues: {
      judul: '',
      deskripsi: '',
      lokasi: '',
      tingkatUrgensi: 'SEDANG' as 'RENDAH' | 'SEDANG' | 'TINGGI' | 'DARURAT',
      fotoBuktiUrl: '',
    },
    onSubmit: async ({ value }) => {
      const parsed = laporanKeamananSchema.safeParse(value);
      if (!parsed.success) {
        alert(parsed.error.issues[0]?.message || 'Data laporan tidak valid');
        return;
      }
      await onSubmit(parsed.data);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6 max-w-xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Pelaporan Insiden Lingkungan
          </h2>
          <p className="text-xs text-slate-500">
            Kirimkan laporan keamanan untuk ditindaklanjuti cepat oleh petugas keamanan dan pengurus RT.
          </p>
        </div>
      </div>

      {/* Judul Laporan */}
      <form.Field name="judul">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Judul Laporan / Kejadian</Label>
            <Input
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Contoh: Lampu jalan mati di Blok B3 / Orang mencurigakan"
              className="rounded-xl"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-rose-500">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      {/* Lokasi */}
      <form.Field name="lokasi">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Lokasi Spesifik Kejadian</Label>
            <Input
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Contoh: Depan Pos Ronda Blok A / Gang RT 04"
              className="rounded-xl"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-rose-500">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      {/* Tingkat Urgensi */}
      <form.Field name="tingkatUrgensi">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Tingkat Urgensi</Label>
            <div className="grid grid-cols-4 gap-2">
              {(['RENDAH', 'SEDANG', 'TINGGI', 'DARURAT'] as const).map((urg) => (
                <button
                  type="button"
                  key={urg}
                  onClick={() => field.handleChange(urg)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all ${
                    field.state.value === urg
                      ? urg === 'DARURAT'
                        ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20'
                        : urg === 'TINGGI'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                        : urg === 'SEDANG'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                        : 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {urg}
                </button>
              ))}
            </div>
          </div>
        )}
      </form.Field>

      {/* Deskripsi Kejadian */}
      <form.Field name="deskripsi">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Deskripsi Lengkap Kronologi</Label>
            <Textarea
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Jelaskan detail kejadian, perkiraan waktu, dan pihak yang terlibat..."
              className="rounded-xl min-h-[120px]"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-rose-500">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      <Button type="submit" disabled={isLoading} className="w-full gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Mengirim Laporan...</span>
          </>
        ) : (
          <>
            <ShieldAlert className="w-4 h-4" />
            <span>Kirim Laporan Keamanan</span>
          </>
        )}
      </Button>
    </form>
  );
}
