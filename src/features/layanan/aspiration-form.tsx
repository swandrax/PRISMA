import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { aspirasiFormSchema, AspirasiFormInput } from '@/lib/validation';
import { ASPIRASI_CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquarePlus, Loader2 } from 'lucide-react';

export interface AspirationFormProps {
  onSubmit: (values: AspirasiFormInput) => Promise<void>;
  isLoading?: boolean;
}

export function AspirationForm({ onSubmit, isLoading = false }: AspirationFormProps) {
  const form = useForm({
    defaultValues: {
      judul: '',
      deskripsi: '',
      kategori: 'UMUM' as 'KEAMANAN' | 'KEBERSIHAN' | 'INFRASTRUKTUR' | 'ADMINISTRASI' | 'SOSIAL' | 'UMUM',
      tingkatUrgensi: 'SEDANG' as const,
      fotoLampiranUrl: '',
    },
    onSubmit: async ({ value }) => {
      const parsed = aspirasiFormSchema.safeParse(value);
      if (!parsed.success) {
        alert(parsed.error.issues[0]?.message || 'Data aspirasi tidak valid');
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
        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600">
          <MessageSquarePlus className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Sampaikan Aspirasi & Saran Warga
          </h2>
          <p className="text-xs text-slate-500">
            Kanal aspirasi warga RT 04 untuk perbaikan fasilitas, kebersihan, dan kerukunan lingkungan.
          </p>
        </div>
      </div>

      {/* Kategori */}
      <form.Field name="kategori">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Kategori Aspirasi</Label>
            <select
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value as 'KEAMANAN' | 'KEBERSIHAN' | 'INFRASTRUKTUR' | 'ADMINISTRASI' | 'SOSIAL' | 'UMUM')}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            >
              {ASPIRASI_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </form.Field>

      {/* Judul */}
      <form.Field name="judul">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Judul Pokok Aspirasi</Label>
            <Input
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Contoh: Pengadaan tong sampah terpilah di Blok C"
              className="rounded-xl"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-rose-500">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      {/* Deskripsi */}
      <form.Field name="deskripsi">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Uraian & Saran Solusi</Label>
            <Textarea
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Jelaskan kebutuhan, latar belakang, atau usulan solusi..."
              className="rounded-xl min-h-[120px]"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-rose-500">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      </form.Field>

      <Button type="submit" disabled={isLoading} className="w-full gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Mengirimkan Aspirasi...</span>
          </>
        ) : (
          <>
            <MessageSquarePlus className="w-4 h-4" />
            <span>Kirim Aspirasi ke Pengurus</span>
          </>
        )}
      </Button>
    </form>
  );
}
