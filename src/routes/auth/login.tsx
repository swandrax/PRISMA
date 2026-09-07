import * as React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { loginSchema, LoginInput } from '@/lib/validation';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Loader2, ArrowRight } from 'lucide-react';

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }: { value: LoginInput }) => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Login gagal');
        }

        setUser(data.user);
        navigate({ to: '/dashboard' as any });
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Masuk ke Portal PRISMA
          </h1>
          <p className="text-xs text-slate-500">
            Sistem Informasi & Tata Kelola Warga RT 04 / RW 09
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {errorMsg}
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
          <form.Field
            name="email"
            children={(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Alamat Email</Label>
                <Input
                  id={field.name}
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="warga@prisma.id"
                  className="rounded-xl"
                  autoComplete="email"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-rose-500">{field.state.meta.errors[0]?.message}</p>
                )}
              </div>
            )}
          />

          <form.Field
            name="password"
            children={(field) => (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor={field.name}>Kata Sandi</Label>
                  <a href="/auth/reset" className="text-[11px] text-primary hover:underline">
                    Lupa sandi?
                  </a>
                </div>
                <Input
                  id={field.name}
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl"
                  autoComplete="current-password"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-rose-500">{field.state.meta.errors[0]?.message}</p>
                )}
              </div>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full gap-2 rounded-xl">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>Masuk Sekarang</span>
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          Belum terdaftar sebagai warga digital?{' '}
          <a href="/auth/register" className="font-semibold text-primary hover:underline">
            Daftar di sini
          </a>
        </div>
      </div>
    </div>
  );
}
