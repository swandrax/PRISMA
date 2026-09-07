import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { suratFormSchema, SuratFormInput } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Send } from 'lucide-react';

export interface SuratFormProps {
  onSubmit: (values: SuratFormInput) => Promise<void>;
  isLoading?: boolean;
}

export function SuratForm({ onSubmit, isLoading = false }: SuratFormProps) {
  const form = useForm({
    defaultValues: {
      jenisSurat: 'Keterangan Domisili' as 'Keterangan Domisili' | 'Keterangan Pengantar SKCK' | 'Keterangan Usaha (SKU)' | 'Keterangan Kematian' | 'Keterangan Tidak Mampu (SKTM)' | 'Keterangan Belum Menikah' | 'Keterangan Lainnya',
      keperluan: '',
      catatan: '',
      fileDokumenUrl: '',
    },
    onSubmit: async ({ value }) => {
      const parsed = suratFormSchema.safeParse(value);
      if (!parsed.success) {
        alert(parsed.error.issues[0]?.message || 'Data permohonan surat tidak valid');
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
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Pengajuan Surat Keterangan RT
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Lengkapi detail permohonan surat administrasi untuk diproses oleh Ketua RT/Pengurus.
        </p>
      </div>

      {/* Jenis Surat */}
      <form.Field name="jenisSurat">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Jenis Surat</Label>
            <select
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value as 'Keterangan Domisili')}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Keterangan Domisili">Surat Keterangan Domisili</option>
              <option value="Keterangan Pengantar SKCK">Surat Pengantar SKCK</option>
              <option value="Keterangan Usaha (SKU)">Surat Keterangan Usaha (SKU)</option>
              <option value="Keterangan Kematian">Surat Keterangan Kematian</option>
              <option value="Keterangan Tidak Mampu (SKTM)">Surat Keterangan Tidak Mampu (SKTM)</option>
              <option value="Keterangan Belum Menikah">Surat Keterangan Belum Menikah</option>
              <option value="Keterangan Lainnya">Surat Keterangan Lainnya</option>
            </select>
          </div>
        )}
      </form.Field>

      {/* Keperluan */}
      <form.Field name="keperluan">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Keperluan / Tujuan Pengajuan</Label>
            <Input
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Contoh: Pembuatan Paspor / Pembukaan Rekening Bank"
              className="rounded-xl"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-rose-500">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      {/* Catatan Tambahan */}
      <form.Field name="catatan">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Catatan Tambahan (Opsional)</Label>
            <Textarea
              id={field.name}
              value={field.state.value || ''}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Keterangan pendukung jika diperlukan..."
              className="rounded-xl min-h-[90px]"
            />
          </div>
        )}
      </form.Field>

      <Button type="submit" disabled={isLoading} className="w-full gap-2 rounded-xl">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Memproses Permohonan...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Kirim Pengajuan Surat</span>
          </>
        )}
      </Button>
    </form>
  );
}
