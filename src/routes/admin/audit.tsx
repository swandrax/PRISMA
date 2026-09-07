import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/queries/query-keys';
import { DataTable } from '@/components/data-display/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { tableSearchSchema, TableSearchInput } from '@/lib/validation';
import { formatDateID } from '@/lib/formatting';
import { Activity, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/admin/audit')({
  validateSearch: (search: Record<string, unknown>): TableSearchInput => {
    return tableSearchSchema.parse(search);
  },
  component: AuditLogsPage,
});

interface AuditLogItem {
  id: string;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  requestId?: string | null;
  createdAt: string | Date;
}

function AuditLogsPage() {
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();
  const [searchInput, setSearchInput] = React.useState(searchParams.search || '');

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.audit.list(searchParams),
    queryFn: async () => {
      const sp = new URLSearchParams();
      sp.set('page', String(searchParams.page));
      sp.set('limit', String(searchParams.limit));
      if (searchParams.search) sp.set('search', searchParams.search);

      const res = await fetch(`/api/admin/audit?${sp.toString()}`);
      if (!res.ok) throw new Error('Gagal memuat audit log');
      return await res.json();
    },
  });

  const columns = React.useMemo<ColumnDef<AuditLogItem>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Waktu (WIB)',
        cell: (info) => (
          <span className="font-mono text-xs text-slate-500">
            {formatDateID(info.getValue() as string, true)}
          </span>
        ),
      },
      {
        accessorKey: 'actorEmail',
        header: 'Aktor & Peran',
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">
              {row.original.actorEmail || 'System / Service'}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Peran: {row.original.actorRole || 'SYSTEM'}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'action',
        header: 'Aksi Sistem',
        cell: (info) => (
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'resource',
        header: 'Entitas / Resource',
        cell: ({ row }) => (
          <div>
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
              {row.original.resource}
            </span>
            {row.original.resourceId && (
              <div className="font-mono text-[10px] text-slate-400">
                ID: {row.original.resourceId.slice(0, 8)}...
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'details',
        header: 'Keterangan',
        cell: (info) => (
          <span className="text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate block">
            {(info.getValue() as string) || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'ipAddress',
        header: 'IP Address',
        cell: (info) => (
          <span className="font-mono text-[11px] text-slate-400">
            {(info.getValue() as string) || '127.0.0.1'}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Audit Trail & Integritas Data</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Log Audit Sistem Keamanan
          </h1>
          <p className="text-xs text-slate-500">
            Pencatatan menyeluruh setiap perubahan data, akses autentikasi, dan aksi administratif dengan sanitasi kredensial otomatis.
          </p>
        </div>

        <Button
          onClick={() => window.open('/api/export/audit', '_blank')}
          variant="outline"
          className="gap-2 rounded-xl"
        >
          <Download className="w-4 h-4" />
          Ekspor Log CSV
        </Button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({
            search: (prev) => ({ ...prev, search: searchInput, page: 1 }),
          });
        }}
        className="flex gap-2 max-w-md"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari aksi, aktor, atau resource..."
            className="pl-9 rounded-xl"
          />
        </div>
        <Button type="submit" variant="secondary" className="rounded-xl">
          Cari
        </Button>
      </form>

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
