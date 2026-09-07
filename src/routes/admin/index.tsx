import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ShieldCheck, Users, Activity, KeyRound, BellRing, ArrowRight } from 'lucide-react';

export const Route = createFileRoute('/admin/')({
  component: AdminOverviewPage,
});

const ADMIN_CARDS = [
  {
    title: 'Manajemen Pengguna',
    desc: 'Pengaturan akun warga, staff RT, dan otorisasi login.',
    icon: Users,
    link: '/admin/users',
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40',
  },
  {
    title: 'Log Audit & Keamanan',
    desc: 'Audit trail seluruh mutasi data dan aksi administratif.',
    icon: Activity,
    link: '/admin/audit',
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    title: 'Peran & Hak Akses (RBAC)',
    desc: 'Konfigurasi matriks izin granular untuk setiap jabatan RT.',
    icon: KeyRound,
    link: '/admin/roles',
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
  },
  {
    title: 'Siaran Pengumuman',
    desc: 'Penerbitan dan penjadwalan edaran resmi warga.',
    icon: BellRing,
    link: '/admin/pengumuman',
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40',
  },
];

function AdminOverviewPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Panel Kontrol Administrator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Administrasi Sistem PRISMA RT 04
        </h1>
        <p className="text-xs text-slate-500">
          Pengelolaan akun, audit keamanan, dan operasional platform terpusat.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {ADMIN_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.link}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-primary transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500">{card.desc}</p>
              </div>

              <div className="pt-4 mt-2 flex items-center text-xs font-semibold text-primary gap-1">
                <span>Kelola Modul</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
