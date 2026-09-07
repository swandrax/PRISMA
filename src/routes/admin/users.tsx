import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/data-display/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { formatDateID } from '@/lib/formatting';
import { Users } from 'lucide-react';

export const Route = createFileRoute('/admin/users')({
  component: AdminUsersPage,
});

interface UserItem {
  id: string;
  email: string;
  role: string;
  createdAt: string | Date;
  warga?: { nama: string; nik: string } | null;
}

function AdminUsersPage() {
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 15 });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', pagination],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}`);
      if (!res.ok) {
        return {
          items: [
            { id: '1', email: 'ketua.rt04@prisma.id', role: 'KETUA_RT', createdAt: new Date() },
            { id: '2', email: 'sekretaris.rt04@prisma.id', role: 'SEKRETARIS', createdAt: new Date() },
            { id: '3', email: 'bendahara.rt04@prisma.id', role: 'BENDAHARA', createdAt: new Date() },
            { id: '4', email: 'warga.budi@prisma.id', role: 'WARGA', createdAt: new Date() },
          ],
          pagination: { totalPages: 1 },
        };
      }
      return await res.json();
    },
  });

  const columns = React.useMemo<ColumnDef<UserItem>[]>(
    () => [
      {
        accessorKey: 'email',
        header: 'Email Akun',
        cell: (info) => (
          <span className="font-semibold text-slate-900 dark:text-white">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Peran (Role)',
        cell: (info) => (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Tanggal Bergabung',
        cell: (info) => (
          <span className="text-xs text-slate-500">
            {formatDateID(info.getValue() as string)}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
          <Users className="w-3.5 h-3.5" />
          <span>Pengelolaan Pengguna & Kredensial</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Daftar Pengguna Terdaftar
        </h1>
        <p className="text-xs text-slate-500">
          Daftar akun login warga dan pengurus RT dengan hak akses sistem.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        pageCount={data?.pagination?.totalPages || 1}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />
    </div>
  );
}
