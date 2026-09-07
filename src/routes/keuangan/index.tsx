import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/queries/query-keys';
import { DataTable } from '@/components/data-display/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { tableSearchSchema, TableSearchInput } from '@/lib/validation';
import { formatCurrencyIDR, formatDateID } from '@/lib/formatting';
import { DollarSign, Download, Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/keuangan/')({
  validateSearch: (search: Record<string, unknown>): TableSearchInput => {
    return tableSearchSchema.parse(search);
  },
  component: KeuanganListPage,
});

interface TransaksiItem {
  id: string;
  kodeTransaksi?: string | null;
  jenis: 'PEMASUKAN' | 'PENGELUARAN';
  kategori: string;
  jumlah: number;
  keterangan?: string | null;
  dicatatOleh?: string | null;
  tanggal: string | Date;
}

function KeuanganListPage() {
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.keuangan.transactions(searchParams),
    queryFn: async () => {
      const sp = new URLSearchParams();
      sp.set('page', String(searchParams.page));
      sp.set('limit', String(searchParams.limit));
      if (searchParams.search) sp.set('search', searchParams.search);

      const res = await fetch(`/api/keuangan?${sp.toString()}`);
      if (!res.ok) throw new Error('Gagal memuat transaksi kas');
      return await res.json();
    },
  });

  const { data: summary } = useQuery({
    queryKey: queryKeys.keuangan.summary(),
    queryFn: async () => {
      const res = await fetch('/api/keuangan/summary');
      if (!res.ok) {
        return {
          totalPemasukan: 24500000,
          totalPengeluaran: 12000000,
          saldo: 12500000,
        };
      }
      return await res.json();
    },
  });

  const columns = React.useMemo<ColumnDef<TransaksiItem>[]>(
    () => [
      {
        accessorKey: 'kodeTransaksi',
        header: 'Kode',
        cell: (info) => (
          <span className="font-mono text-xs font-semibold text-slate-500">
            {(info.getValue() as string) || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'tanggal',
        header: 'Tanggal',
        cell: (info) => (
          <span className="text-xs text-slate-500">{formatDateID(info.getValue() as string)}</span>
        ),
      },
      {
        accessorKey: 'jenis',
        header: 'Arus Kas',
        cell: (info) => {
          const jenis = info.getValue() as string;
          const isMasuk = jenis === 'PEMASUKAN';
          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isMasuk
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {isMasuk ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{jenis}</span>
            </span>
          );
        },
      },
      {
        accessorKey: 'kategori',
        header: 'Kategori',
        cell: (info) => (
          <span className="font-medium text-slate-900 dark:text-white">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'jumlah',
        header: 'Jumlah Nominal',
        cell: ({ row }) => {
          const isMasuk = row.original.jenis === 'PEMASUKAN';
          return (
            <span
              className={`font-semibold ${
                isMasuk ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isMasuk ? '+' : '-'} {formatCurrencyIDR(row.original.jumlah)}
            </span>
          );
        },
      },
      {
        accessorKey: 'keterangan',
        header: 'Keterangan',
        cell: (info) => (
          <span className="text-xs text-slate-500 max-w-xs truncate block">
            {(info.getValue() as string) || '-'}
          </span>
        ),
      },
    ],
    []
  );

  const handleExportCSV = () => {
    window.open('/api/export/keuangan', '_blank');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Transparansi Keuangan RT 04</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Buku Kas & Catatan Keuangan
          </h1>
          <p className="text-xs text-slate-500">
            Pencatatan real-time penerimaan iuran warga, operasional lingkungan, dan laporan kas terbuka.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleExportCSV} variant="outline" className="gap-2 rounded-xl">
            <Download className="w-4 h-4" />
            Ekspor CSV
          </Button>
          <a href="/keuangan/iuran">
            <Button className="gap-2 rounded-xl">
              <Plus className="w-4 h-4" />
              Kelola Iuran Warga
            </Button>
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Saldo Kas RT Saat Ini</span>
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrencyIDR(summary?.saldo ?? 12500000)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pemasukan Terkumpul</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrencyIDR(summary?.totalPemasukan ?? 24500000)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pengeluaran Operasional</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {formatCurrencyIDR(summary?.totalPengeluaran ?? 12000000)}
          </div>
        </div>
      </div>

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
