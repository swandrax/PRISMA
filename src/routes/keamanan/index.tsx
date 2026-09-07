import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/queries/query-keys';
import { DataTable } from '@/components/data-display/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { tableSearchSchema, TableSearchInput } from '@/lib/validation';
import { formatDateID } from '@/lib/formatting';
import { ShieldAlert, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/keamanan/')({
  validateSearch: (search: Record<string, unknown>): TableSearchInput => {
    return tableSearchSchema.parse(search);
  },
  component: KeamananListPage,
});

interface LaporanItem {
  id: string;
  nomorLaporan?: string | null;
  judul: string;
  lokasi?: string | null;
  status: string;
  tingkatUrgensi: string;
  tanggal: string | Date;
  pelapor?: { nama: string };
}

function KeamananListPage() {
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.keamanan.list(searchParams),
    queryFn: async () => {
      const sp = new URLSearchParams();
      sp.set('page', String(searchParams.page));
      sp.set('limit', String(searchParams.limit));

      const res = await fetch(`/api/keamanan?${sp.toString()}`);
      if (!res.ok) throw new Error('Gagal memuat laporan keamanan');
      return await res.json();
    },
  });

  const columns = React.useMemo<ColumnDef<LaporanItem>[]>(
    () => [
      {
        accessorKey: 'nomorLaporan',
        header: 'No. Laporan',
        cell: (info) => (
          <span className="font-mono text-xs font-semibold text-slate-500">
            {(info.getValue() as string) || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'judul',
        header: 'Judul Kejadian',
        cell: (info) => (
          <div className="font-semibold text-slate-900 dark:text-white">
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: 'lokasi',
        header: 'Lokasi',
        cell: (info) => <span className="text-xs text-slate-500">{(info.getValue() as string) || '-'}</span>,
      },
      {
        accessorKey: 'tingkatUrgensi',
        header: 'Urgensi',
        cell: (info) => {
          const urg = info.getValue() as string;
          let color = 'bg-slate-100 text-slate-700';
          if (urg === 'DARURAT') color = 'bg-red-600 text-white font-bold animate-pulse';
          else if (urg === 'TINGGI') color = 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300';
          else if (urg === 'SEDANG') color = 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
          else color = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';

          return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
              {urg}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'tanggal',
        header: 'Waktu Laporan',
        cell: (info) => (
          <span className="text-xs text-slate-500">{formatDateID(info.getValue() as string, true)}</span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Sistem Tanggap Keamanan Lingkungan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Laporan Keamanan & Ketertiban
          </h1>
          <p className="text-xs text-slate-500">
            Daftar pelaporan kejadian, insiden ketertiban, dan pemantauan respons cepat petugas jaga RT.
          </p>
        </div>

        <Link to="/keamanan/lapor">
          <Button className="gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white">
            <Plus className="w-4 h-4" />
            Buat Laporan Baru
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        pageCount={data?.pagination?.totalPages || 1}
        pagination={{
          pageIndex: (searchParams.page ?? 1) - 1,
          pageSize: searchParams.limit ?? 10,
        }}
        onPaginationChange={(p) => {
          navigate({
            search: (prev) => ({
              ...prev,
              page: p.pageIndex + 1,
              limit: p.pageSize,
            }),
          });
        }}
        isLoading={isLoading}
      />
    </div>
  );
}
