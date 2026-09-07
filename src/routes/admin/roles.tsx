import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ROLES, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, AppRole } from '@/lib/constants';
import { KeyRound, ShieldCheck, Check, Info } from 'lucide-react';

export const Route = createFileRoute('/admin/roles')({
  component: RolesManagementPage,
});

function RolesManagementPage() {
  const [selectedRole, setSelectedRole] = React.useState<AppRole>('KETUA_RT');

  const allPermissions = Object.values(PERMISSIONS);
  const currentRolePermissions = DEFAULT_ROLE_PERMISSIONS[selectedRole] || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-2">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Konfigurasi Hak Akses Granular</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Role-Based Access Control (RBAC)
        </h1>
        <p className="text-xs text-slate-500">
          Struktur otorisasi berbasis izin (permissions) terpisah untuk setiap peran struktural RT 04.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Role List Selector */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
            Pilih Peran Pengurus
          </h3>
          {Object.keys(ROLES).map((r) => {
            const roleKey = r as AppRole;
            const isSelected = selectedRole === roleKey;
            return (
              <button
                key={roleKey}
                onClick={() => setSelectedRole(roleKey)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{roleKey}</span>
                {isSelected && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>

        {/* Permissions Grid */}
        <div className="lg:col-span-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Daftar Izin untuk: <span className="text-primary">{selectedRole}</span>
              </h2>
              <p className="text-xs text-slate-500">
                Total {currentRolePermissions.length} dari {allPermissions.length} hak akses aktif
              </p>
            </div>
            <div className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400">
              Prinsip Least-Privilege
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allPermissions.map((perm) => {
              const isGranted = currentRolePermissions.includes(perm);
              return (
                <div
                  key={perm}
                  className={`p-3.5 rounded-xl border transition-colors flex items-center justify-between ${
                    isGranted
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-slate-50/40 dark:bg-slate-800/20 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                  }`}
                >
                  <div>
                    <div className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                      {perm}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Modul: {perm.split('.')[0]?.toUpperCase()}
                    </div>
                  </div>
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isGranted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
