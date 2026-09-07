import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { FileText, ShieldAlert, DollarSign, MessageSquare, CreditCard, ArrowRight } from 'lucide-react';

export const Route = createFileRoute('/layanan/')({
  component: LayananHubPage,
});

const SERVICES = [
  {
    title: 'Surat Pengantar RT',
    desc: 'Pengajuan surat domisili, SKCK, izin usaha, dan surat keterangan resmi lainnya.',
    icon: FileText,
    link: '/surat/ajukan',
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    title: 'Kartu Identitas Digital',
    desc: 'Lihat dan cetak Kartu Warga Digital berotentikasi QR resmi PRISMA RT 04.',
    icon: CreditCard,
    link: '/warga/card',
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40',
  },
  {
    title: 'Iuran & Kas Komunitas',
    desc: 'Cek tagihan iuran bulanan, unggah bukti bayar, dan pantau rekapitulasi kas.',
    icon: DollarSign,
    link: '/keuangan/iuran',
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
  },
  {
    title: 'Lapor Keamanan Cepat',
    desc: 'Laporkan insiden darurat, gangguan ketertiban, atau kerusakan fasilitas umum.',
    icon: ShieldAlert,
    link: '/keamanan/lapor',
    color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40',
  },
  {
    title: 'Aspirasi & Keluhan Warga',
    desc: 'Kanal penyampaian saran, aspirasi, dan evaluasi langsung kepada pengurus RT.',
    icon: MessageSquare,
    link: '/layanan/aspirasi',
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40',
  },
];

function LayananHubPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Pusat Layanan Terpadu RT 04
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Akses seluruh fasilitas pelayanan kependudukan digital dalam satu portal terpadu.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.title}
              to={s.link}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-primary transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">{s.desc}</p>
              </div>

              <div className="pt-4 mt-2 flex items-center text-xs font-semibold text-primary gap-1">
                <span>Akses Layanan</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
