import * as React from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { SuratForm } from '@/features/surat/surat-form';
import { SuratFormInput } from '@/lib/validation';
import { ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/surat/ajukan')({
  component: AjukanSuratPage,
});

function AjukanSuratPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (values: SuratFormInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/surat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error('Gagal mengajukan surat');
      const data = await res.json();
      navigate({ to: '/surat/$id', params: { id: data.id } as any });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4 py-8">
      <Link to="/surat" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary">
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Daftar Surat</span>
      </Link>

      <SuratForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
