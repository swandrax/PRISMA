import * as React from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { registerSchema } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCheck, AlertCircle } from 'lucide-react';

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      nik: '',
      nama: '',
      rt: '04',
      rw: '09',
      telepon: '',
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setErrorMsg(null);
      const parsed = registerSchema.safeParse(value);
      if (!parsed.success) {
        setIsLoading(false);
        setErrorMsg(parsed.error.issues[0]?.message || 'Data tidak valid');
        return;
      }
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Pendaftaran gagal');
        }

        navigate({ to: '/auth/login' });
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-xl w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-2">
            <UserCheck className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Pendaftaran Akun Warga
          </h2>
          <p className="text-xs text-slate-500">
            Daftarkan akun digital RT 04 / RW 09 untuk mengakses layanan surat, iuran, dan transparansi
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <form.Field name="nama">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Nama Lengkap Sesuai KTP</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Budi Santoso"
                    className="rounded-xl"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-rose-500">{String(field.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="nik">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>NIK (16 Digit)</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="3171012345670001"
                    maxLength={16}
                    className="rounded-xl font-mono"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-rose-500">{String(field.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="email">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Alamat Email</Label>
                <Input
                  id={field.name}
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="budi@example.com"
                  className="rounded-xl"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-rose-500">{String(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <form.Field name="password">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Password</Label>
                  <Input
                    id={field.name}
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="rounded-xl"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-rose-500">{String(field.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="confirmPassword">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Konfirmasi Password</Label>
                  <Input
                    id={field.name}
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ulangi password"
                    className="rounded-xl"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-rose-500">{String(field.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl font-semibold mt-2"
          >
            {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-xs text-slate-500">
            Sudah memiliki akun?{' '}
            <Link to="/auth/login" className="font-semibold text-primary hover:underline">
              Masuk ke akun Anda
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
