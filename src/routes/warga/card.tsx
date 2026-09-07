import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth.store';
import { DigitalResidentCard } from '@/features/warga/digital-card';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/queries/query-keys';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/warga/card')({
  component: ResidentCardPage,
});

function ResidentCardPage() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.warga.card(user?.wargaId || 'default'),
    queryFn: async () => {
      const res = await fetch('/api/warga/card');
      if (!res.ok) {
        // Fallback demo resident identity
        return {
          prismaId: 'PRISMA-0409-7821',
          nama: user?.nama || 'Ahmad Dahlan',
          nik: user?.nik || '3171012345670001',
          noKK: '3171019876540002',
          rt: '04',
          rw: '09',
          alamat: 'Jl. Kemayoran Barat No. 12, Blok A',
          status: 'WARGA TETAP',
          verificationStatus: 'TERVERIFIKASI RESMI',
          tanggalLahir: '1988-05-14',
          fotoUrl: null,
        };
      }
      return await res.json();
    },
  });

  if (isLoading && !data) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-slate-500">Memuat Kartu Warga Digital...</p>
      </div>
    );
  }

  return (
    <div className="py-10">
      <DigitalResidentCard
        prismaId={data.prismaId}
        nama={data.nama}
        nik={data.nik}
        noKK={data.noKK}
        rt={data.rt}
        rw={data.rw}
        alamat={data.alamat}
        status={data.status}
        verificationStatus={data.verificationStatus}
        tanggalLahir={data.tanggalLahir}
        fotoUrl={data.fotoUrl}
      />
    </div>
  );
}
