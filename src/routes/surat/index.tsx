import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/queries/query-keys';
import { DataTable } from '@/components/data-display/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { tableSearchSchema, TableSearchInput } from '@/lib/validation';
import { formatDateID } from '@/lib/formatting';
import { FileText, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/surat/')({
  validateSearch: (search: Record<string, unknown>): TableSearchInput => {
    return tableSearchSchema.parse(search);
  },
  component: SuratListPage,
});

interface SuratItem {
  id: string;
  nomorSurat?: string | null;
  jenisSurat: string;
  keperluan: string;
  status: string;
  tanggalPengajuan: string | Date;
  warga?: { nama: string };
}

function SuratListPage() {
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.surat.list(searchParams),
    queryFn: async () => {
      const sp = new URLSearchParams();
      sp.set('page', String(searchParams.page));
      sp.set('limit', String(searchParams.limit));
      if (searchParams.search) sp.set('search', searchParams.search);

      const res = await fetch(`/api/surat?${sp.toString()}`);
      if (!res.ok) throw new Error('Gagal memuat surat');
      return await res.json();
    },
  });

  const columns = React.useMemo<ColumnDef<SuratItem>[]>(
    () => [
      {
        accessorKey: 'nomorSurat',
        header: 'Nomor Surat',
        cell: (info) => (
          <span className="font-mono text-xs font-semibold text-primary">
            {(info.getValue() as string) || 'Menunggu'}
          </span>
        ),
      },
      {
        accessorKey: 'jenisSurat',
        header: 'Jenis Surat',
        cell: (info) => (
          <div className="font-semibold text-slate-900 dark:text-white">
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: 'keperluan',
        header: 'Keperluan',
        cell: (info) => (
          <div className="text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: 'tanggalPengajuan',
        header: 'Tanggal Pengajuan',
        cell: (info) => (
          <span className="text-xs text-slate-500">
            {formatDateID(info.getValue() as string)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status Alur',
        cell: (info) => {
          const s = info.getValue() as string;
          let color = 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
          if (s === 'COMPLETED' || s === 'SELESAI') {
            color = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
          } else if (s === 'DITOLAK') {
            color = 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300';
          } else if (s === 'REVISI') {
            color = 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
          }
          return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
              {s}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => (
          <Link
            to="/surat/$id"
            params={{ id: row.original.id }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-primary transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <span>Tinjau</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Layanan Administrasi Digital</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Surat Pengantar & Keterangan RT
          </h1>
          <p className="text-xs text-slate-500">
            Pengajuan dan pemrosesan surat resmi secara transparan, bertahap, dan dilengkapi verifikasi QR.
          </p>
        </div>

        <Link to="/surat/ajukan">
          <Button className="gap-2 rounded-xl">
            <Plus className="w-4 h-4" />
            Ajukan Surat Baru
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
