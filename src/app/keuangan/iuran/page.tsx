"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft,
    Wallet,
    CheckCircle,
    Clock,
    AlertCircle,
    Users,
    TrendingUp,
    Search,
    Download,
    ChevronRight
} from "lucide-react"
import { DEFAULT_IURAN_CONFIG, formatRupiah, getIuranComplianceRate } from "@/lib/strategic-recommendations"

interface WargaIuran {
    id: number;
    nama: string;
    alamat: string;
    lastPayment: string | null;
    status: 'paid' | 'pending' | 'overdue';
    monthsPaid: number;
}

// Mock data - in production, fetch from API
const mockWargaIuran: WargaIuran[] = [
    { id: 1, nama: "Ahmad Suryanto", alamat: "Gg. Bugis No.95", lastPayment: "2026-01-15", status: "paid", monthsPaid: 7 },
    { id: 2, nama: "Erry Adu Sundaru", alamat: "Gg. Bugis No.96", lastPayment: "2025-12-20", status: "pending", monthsPaid: 6 },
    { id: 3, nama: "Citra Dewi", alamat: "Gg. Bugis No.97", lastPayment: "2026-01-10", status: "paid", monthsPaid: 7 },
    { id: 4, nama: "Dedy Kurniawan", alamat: "Gg. Bugis No.98", lastPayment: "2025-11-15", status: "overdue", monthsPaid: 5 },
    { id: 5, nama: "Endang Susanti", alamat: "Gg. Bugis No.99", lastPayment: "2026-01-12", status: "paid", monthsPaid: 7 },
    { id: 6, nama: "Farid Hidayat", alamat: "Gg. Bugis No.100", lastPayment: "2026-01-08", status: "paid", monthsPaid: 7 },
    { id: 7, nama: "Gita Permata", alamat: "Gg. Bugis No.101", lastPayment: "2025-12-28", status: "pending", monthsPaid: 6 },
    { id: 8, nama: "Hendra Wijaya", alamat: "Gg. Bugis No.102", lastPayment: "2026-01-05", status: "paid", monthsPaid: 7 },
];

export default function IuranPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
    const [wargaData] = useState<WargaIuran[]>(mockWargaIuran);

    const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    const stats = {
        totalKK: wargaData.length,
        paid: wargaData.filter(w => w.status === 'paid').length,
        pending: wargaData.filter(w => w.status === 'pending').length,
        overdue: wargaData.filter(w => w.status === 'overdue').length,
    };

    const complianceRate = getIuranComplianceRate(stats.paid, stats.totalKK);
    const expectedIncome = stats.totalKK * DEFAULT_IURAN_CONFIG.nominal;
    const actualIncome = stats.paid * DEFAULT_IURAN_CONFIG.nominal;

    const filteredWarga = wargaData.filter(w => {
        const matchesSearch = w.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.alamat.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || w.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusBadge = (status: WargaIuran['status']) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="h-3 w-3" /> Lunas
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Clock className="h-3 w-3" /> Menunggu
                    </span>
                );
            case 'overdue':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <AlertCircle className="h-3 w-3" /> Terlambat
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                    <Button variant="outline" asChild>
                        <Link href="/keuangan/laporan">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <Wallet className="h-3 w-3" /> Rekomendasi #1
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">Manajemen Iuran Warga</h1>
                        <p className="text-muted-foreground">Tingkat iuran: {formatRupiah(DEFAULT_IURAN_CONFIG.nominal)} / bulan • Periode: {currentMonth}</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Total KK</p>
                                    <p className="text-3xl font-bold">{stats.totalKK}</p>
                                </div>
                                <Users className="h-8 w-8 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">Sudah Bayar</p>
                                    <p className="text-3xl font-bold">{stats.paid}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-amber-100 text-sm">Belum Bayar</p>
                                    <p className="text-3xl font-bold">{stats.pending}</p>
                                </div>
                                <Clock className="h-8 w-8 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-red-500 to-red-600 border-0 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-100 text-sm">Terlambat</p>
                                    <p className="text-3xl font-bold">{stats.overdue}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Compliance Rate & Income */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                Tingkat Kepatuhan
                            </CardTitle>
                            <CardDescription>Persentase warga yang sudah membayar bulan ini</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-end gap-2">
                                    <span className="text-5xl font-bold text-green-600">{complianceRate.toFixed(0)}%</span>
                                    <span className="text-muted-foreground text-sm pb-2">kepatuhan</span>
                                </div>
                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${complianceRate}%` }}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Target: 100% kepatuhan. Tingkatkan dengan pengingat otomatis dan kemudahan pembayaran digital.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-blue-500" />
                                Pendapatan Iuran
                            </CardTitle>
                            <CardDescription>Realisasi vs target bulan ini</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-1">Terkumpul</p>
                                        <p className="text-xl font-bold text-green-600">{formatRupiah(actualIncome)}</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-1">Target</p>
                                        <p className="text-xl font-bold text-blue-600">{formatRupiah(expectedIncome)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                    <span className="text-sm text-amber-700 dark:text-amber-400">
                                        Selisih: {formatRupiah(expectedIncome - actualIncome)} ({stats.pending + stats.overdue} KK)
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter & Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Cari warga..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="flex gap-2">
                        {(['all', 'paid', 'pending', 'overdue'] as const).map((status) => (
                            <Button
                                key={status}
                                variant={filterStatus === status ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterStatus(status)}
                                className="capitalize"
                            >
                                {status === 'all' ? 'Semua' : status === 'paid' ? 'Lunas' : status === 'pending' ? 'Pending' : 'Terlambat'}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Warga List */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Daftar Iuran Warga</CardTitle>
                            <CardDescription>{filteredWarga.length} warga ditemukan</CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {filteredWarga.map((warga) => (
                                <div
                                    key={warga.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-sm font-bold text-primary">{warga.nama.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{warga.nama}</h4>
                                            <p className="text-sm text-muted-foreground">{warga.alamat}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs text-muted-foreground">Terakhir bayar</p>
                                            <p className="text-sm font-medium">
                                                {warga.lastPayment
                                                    ? new Date(warga.lastPayment).toLocaleDateString('id-ID', { dateStyle: 'medium' })
                                                    : '-'
                                                }
                                            </p>
                                        </div>
                                        {getStatusBadge(warga.status)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="mt-8 flex flex-wrap gap-4">
                    <Button asChild>
                        <Link href="/keuangan/pembayaran">
                            <Wallet className="h-4 w-4 mr-2" />
                            Catat Pembayaran
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/keuangan/share">
                            Kirim Pengingat WhatsApp
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
