import * as React from 'react';
import { ShieldCheck, Activity, Users, KeyRound, Database, Server, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AdminDashboardProps {
  health: {
    status: string;
    uptimeSeconds: number;
    database: { connected: boolean; responseTimeMs?: number };
    storage: { configured: boolean; region?: string };
    memory: { heapUsedMB: number };
  };
  stats: {
    totalUsers: number;
    totalAuditLogs: number;
    activeRolesCount: number;
  };
  recentAudits: Array<{
    id: string;
    actorEmail?: string | null;
    action: string;
    resource: string;
    createdAt: string | Date;
  }>;
}

export function AdminDashboard({ health, stats, recentAudits }: AdminDashboardProps) {
  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator RT/RW System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Pusat Kendali Sistem & Audit
          </h1>
          <p className="text-sm text-slate-500">
            Monitoring otorisasi RBAC, integritas audit trail, dan status kesehatan infrastruktur cloud.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/admin/audit">
            <Button size="sm" variant="outline" className="gap-2">
              <Activity className="w-4 h-4" />
              Audit Log Lengkap
            </Button>
          </a>
        </div>
      </div>

      {/* System Health Strip */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Status Sistem</div>
            <div className="text-sm font-bold text-emerald-600 capitalize">{health.status}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">PostgreSQL Database</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {health.database.connected ? `Terkoneksi (${health.database.responseTimeMs}ms)` : 'Terputus'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">AWS S3 Storage</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {health.storage.configured ? `Aktif (${health.storage.region})` : 'Belum Dikonfigurasi'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Memory Usage</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {health.memory.heapUsedMB} MB
            </div>
          </div>
        </div>
      </div>

      {/* Admin Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <a href="/admin/users" className="block p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary transition-colors group">
          <Users className="w-6 h-6 text-blue-500 mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary flex items-center justify-between">
            <span>Manajemen Pengguna</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Kelola akun warga, staf pengurus, aktivasi auth code, dan status login. Total: {stats.totalUsers} pengguna.
          </p>
        </a>

        <a href="/admin/roles" className="block p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary transition-colors group">
          <KeyRound className="w-6 h-6 text-amber-500 mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary flex items-center justify-between">
            <span>RBAC & Izin Akses</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi granular role-based permissions (Ketua RT, Sekretaris, Bendahara, Seksi Keamanan).
          </p>
        </a>

        <a href="/admin/audit" className="block p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary transition-colors group">
          <Activity className="w-6 h-6 text-emerald-500 mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary flex items-center justify-between">
            <span>Audit Trail & Keamanan</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Jejak digital seluruh aksi sistem, mutasi data, dan autentikasi dengan sanitasi otomatis.
          </p>
        </a>
      </div>

      {/* Recent Audit Trail Preview */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span>Aktivitas Sistem Terkini (Audit Log)</span>
          </h3>
          <a href="/admin/audit" className="text-xs text-primary hover:underline">
            Semua Log
          </a>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentAudits.slice(0, 5).map((a) => (
            <div key={a.id} className="py-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-900 dark:text-white">
                  {a.action} • {a.resource}
                </div>
                <div className="text-slate-500">
                  Aktor: {a.actorEmail || 'System / Anonymous'}
                </div>
              </div>
              <span className="text-slate-400">
                {new Date(a.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
