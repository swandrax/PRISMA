import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/queries/query-keys';
import { DataTable } from '@/components/data-display/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { tableSearchSchema, TableSearchInput } from '@/lib/validation';
import { maskNIK } from '@/lib/formatting';
import { Users, Search, CreditCard, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/warga/')({
  validateSearch: (search: Record<string, unknown>): TableSearchInput => {
    return tableSearchSchema.parse(search);
  },
  component: WargaListPage,
});

interface WargaItem {
  id: string;
  nama: string;
  nik: string;
  jenisKelamin: string;
  blok: string;
  noRumah: string;
  status: string;
  residentVerification?: { prismaId: string; status: string } | null;
}

function WargaListPage() {
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  const [searchInput, setSearchInput] = React.useState(searchParams.search || '');

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.warga.list(searchParams),
    queryFn: async () => {
      const sp = new URLSearchParams();
      sp.set('page', String(searchParams.page));
      sp.set('limit', String(searchParams.limit));
      if (searchParams.search) sp.set('search', searchParams.search);

      const res = await fetch(`/api/warga?${sp.toString()}`);
      if (!res.ok) throw new Error('Gagal memuat data warga');
      return await res.json();
    },
  });

  const columns = React.useMemo<ColumnDef<WargaItem, any>[]>(
    () => [
      {
        accessorKey: 'nama',
        header: 'Nama Lengkap',
        cell: (info) => (
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">
              {info.getValue() as string}
            </div>
            <div className="text-[11px] text-slate-400">
              PRISMA ID: {info.row.original.residentVerification?.prismaId || '-'}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'nik',
        header: 'NIK',
        cell: (info) => (
          <span className="font-mono text-xs">{maskNIK(info.getValue() as string)}</span>
        ),
      },
      {
        accessorKey: 'jenisKelamin',
        header: 'L/P',
        cell: (info) => <span>{info.getValue() as string}</span>,
      },
      {
        id: 'alamat',
        header: 'Alamat',
        cell: ({ row }) => (
          <span>
            Blok {row.original.blok}/{row.original.noRumah}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status Warga',
        cell: (info) => {
          const s = info.getValue() as string;
          return (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                s === 'AKTIF'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {s}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Link
              to="/warga/$id"
              params={{ id: row.original.id }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-primary transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <span>Detail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ),
      },
    ],
    []
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      search: (prev) => ({
        ...prev,
        page: 1,
        search: searchInput,
      }),
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Kependudukan RT 04 / RW 09</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Daftar & Direktori Warga
          </h1>
          <p className="text-xs text-slate-500">
            Pencarian data warga dan verifikasi kartu identitas digital dengan perlindungan privasi.
          </p>
        </div>

        <Link to="/warga/card">
          <Button variant="outline" className="gap-2 rounded-xl">
            <CreditCard className="w-4 h-4" />
            Kartu Warga Saya
          </Button>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari berdasarkan nama atau alamat..."
            className="pl-9 rounded-xl text-sm"
          />
        </div>
        <Button type="submit" variant="secondary" className="rounded-xl">
          Cari
        </Button>
      </form>

      {/* TanStack Table */}
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
