"use client"

import { useEffect, useState } from "react"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Users,
    FileText,
    DollarSign,
    Shield,
    Folder,
    Settings,
    AlertTriangle,
    CheckCircle,
    Clock,
    ChevronRight,
    Upload,
    Download,
    Plus,
    Eye,
    Megaphone,
    Activity
} from "lucide-react"

interface DashboardStats {
    totalWarga: number;
    totalKK: number;
    wargaAktif: number;
    pendatangBaru: number;
    totalSurat: {
        pending: number;
        diproses: number;
        selesai: number;
    };
    totalKeuangan: {
        saldo: number;
        pemasukan: number;
        pengeluaran: number;
    };
    totalLaporan: {
        pending: number;
        resolved: number;
    };
    totalFiles: number;
}

const defaultStats: DashboardStats = {
    totalWarga: 0,
    totalKK: 0,
    wargaAktif: 0,
    pendatangBaru: 0,
    totalSurat: { pending: 0, diproses: 0, selesai: 0 },
    totalKeuangan: { saldo: 0, pemasukan: 0, pengeluaran: 0 },
    totalLaporan: { pending: 0, resolved: 0 },
    totalFiles: 0,
};

interface MenuCard {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    color: string;
    badge?: string;
}

const adminMenus: MenuCard[] = [
    {
        id: 'surat',
        title: 'Proses Permohonan Surat',
        description: 'Tinjau dan setujui permohonan surat pengantar warga',
        icon: FileText,
        href: '/admin/surat',
        color: 'from-blue-600 to-cyan-600',
    },
    {
        id: 'keamanan',
        title: 'Tindak Lanjut Laporan',
        description: 'Bereskan laporan keamanan dan keluhan warga',
        icon: AlertTriangle,
        href: '/admin/keamanan',
        color: 'from-red-600 to-orange-600',
    },
    {
        id: 'warga',
        title: 'Validasi Data Warga',
        description: 'Verifikasi warga baru atau perbarui data',
        icon: Users,
        href: '/admin/warga',
        color: 'from-purple-600 to-pink-600',
    },
    {
        id: 'keuangan',
        title: 'Input Transaksi Keuangan',
        description: 'Catat pemasukan dan pengeluaran kas RT',
        icon: DollarSign,
        href: '/admin/keuangan',
        color: 'from-green-600 to-emerald-600',
    },
    {
        id: 'pengumuman',
        title: 'Buat Pengumuman',
        description: 'Sebarkan informasi atau jadwal ke seluruh warga',
        icon: Megaphone,
        href: '/admin/pengumuman',
        color: 'from-indigo-600 to-purple-600',
    },
    {
        id: 'pengaturan',
        title: 'Pengaturan Sistem',
        description: 'Konfigurasi RT, hak akses, dan preferensi',
        icon: Settings,
        href: '/admin/settings',
        color: 'from-gray-600 to-slate-600',
    },
];

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>(defaultStats);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Initialize supabase client dynamically inside useEffect to avoid SSR issues
                const { createClient } = await import('@/utils/supabase/client');
                const supabase = createClient();
                
                // Fetch stats concurrently
                const [wargaRes, suratRes, keuanganRes] = await Promise.all([
                    supabase.from('warga').select('id', { count: 'exact', head: true }),
                    supabase.from('pengajuan_surat').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
                    supabase.from('keuangan_bulanan').select('saldo').order('tahun', { ascending: false }).order('bulan', { ascending: false }).limit(1)
                ]);

                setStats((prev) => ({
                    ...prev,
                    totalWarga: wargaRes.count || 0,
                    totalSurat: { ...prev.totalSurat, pending: suratRes.count || 0 },
                    totalKeuangan: { ...prev.totalKeuangan, saldo: keuanganRes.data?.[0]?.saldo || 0 }
                }));
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            }
        }
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Dashboard Admin</h1>
                        <p className="text-gray-400">Selamat datang, Administrator</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10">
                            <Link href="/">
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Website
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-0 text-white">
                        <CardContent className="p-4 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-3xl font-bold">{stats.totalSurat.pending}</p>
                                    <p className="text-blue-200 text-sm font-medium mt-1">Surat Perlu Diproses</p>
                                </div>
                                <FileText className="h-8 w-8 opacity-50" />
                            </div>
                            <Button size="sm" variant="secondary" className="w-full mt-4" asChild>
                                <Link href="/admin/surat">Proses Sekarang</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-600 to-red-800 border-0 text-white">
                        <CardContent className="p-4 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-3xl font-bold">{stats.totalLaporan.pending}</p>
                                    <p className="text-red-200 text-sm font-medium mt-1">Laporan Belum Selesai</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 opacity-50" />
                            </div>
                            <Button size="sm" variant="secondary" className="w-full mt-4" asChild>
                                <Link href="/admin/keamanan">Tindak Lanjut</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-600 to-amber-800 border-0 text-white">
                        <CardContent className="p-4 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-3xl font-bold">{stats.pendatangBaru || 0}</p>
                                    <p className="text-amber-200 text-sm font-medium mt-1">Warga Perlu Validasi</p>
                                </div>
                                <Users className="h-8 w-8 opacity-50" />
                            </div>
                            <Button size="sm" variant="secondary" className="w-full mt-4" asChild>
                                <Link href="/admin/warga">Validasi Sekarang</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Aksi Cepat</h2>
                    <div className="flex flex-wrap gap-3">
                        <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
                            <Link href="/admin/files">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Template Surat
                            </Link>
                        </Button>
                        <Button asChild className="bg-purple-600 hover:bg-purple-700">
                            <Link href="/admin/warga">
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Warga
                            </Link>
                        </Button>
                        <Button asChild className="bg-green-600 hover:bg-green-700">
                            <Link href="/admin/keuangan">
                                <Plus className="h-4 w-4 mr-2" />
                                Input Transaksi
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            <Link href="/keuangan/laporan">
                                <Download className="h-4 w-4 mr-2" />
                                Download Laporan
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {adminMenus.map((menu) => {
                        const Icon = menu.icon;
                        return (
                            <Link key={menu.id} href={menu.href} className="group">
                                <Card className={`h-full bg-gradient-to-br ${menu.color} border-0 text-white cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-lg">{menu.title}</h3>
                                                    {menu.badge && (
                                                        <span className="px-2 py-0.5 bg-white/20 rounded text-xs">
                                                            {menu.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-white/80 text-sm">{menu.description}</p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {/* Recent Activity */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Pending Items */}
                    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Clock className="h-5 w-5 text-yellow-400" />
                                Menunggu Tindakan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {stats.totalSurat.pending > 0 && (
                                <Link href="/admin/surat" className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-blue-400" />
                                        <span className="text-gray-300">{stats.totalSurat.pending} permohonan surat pending</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-500" />
                                </Link>
                            )}
                            {stats.totalLaporan.pending > 0 && (
                                <Link href="/admin/keamanan" className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="h-5 w-5 text-red-400" />
                                        <span className="text-gray-300">{stats.totalLaporan.pending} laporan keamanan aktif</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-500" />
                                </Link>
                            )}
                            {stats.totalSurat.pending === 0 && stats.totalLaporan.pending === 0 && (
                                <div className="flex items-center gap-3 p-3 text-green-400">
                                    <CheckCircle className="h-5 w-5" />
                                    <span>Semua tugas telah selesai!</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Storage Info */}
                    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Folder className="h-5 w-5 text-yellow-400" />
                                Penyimpanan File
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Total File</span>
                                <span className="text-white font-semibold">{stats.totalFiles} file</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Template Surat</span>
                                    <span className="text-blue-400">6 file</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Dokumen Keuangan</span>
                                    <span className="text-green-400">12 file</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Foto & Gambar</span>
                                    <span className="text-purple-400">10 file</span>
                                </div>
                            </div>
                            <Button asChild className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700">
                                <Link href="/admin/files">
                                    <Folder className="h-4 w-4 mr-2" />
                                    Kelola File
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
