"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    FileDown,
    ArrowRight,
    TrendingUp,
    TrendingDown,
    Folder,
    FileText,
    Shield,
    BarChart3,
    Download,
    ChevronRight,
    Calendar,
    Lock
} from "lucide-react"
import { useKeuanganViewModel } from "@/viewmodels/useKeuanganViewModel"
import { useAuth } from "@/hooks/useAuth"

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export function AdministrationHub() {
    // ViewModel — single source of truth for keuangan data
    const { expenseSummary, isLoading: loading } = useKeuanganViewModel();
    const { isAuthenticated } = useAuth();

    const expenseCategories = expenseSummary.categories;
    const avgExpense = expenseSummary.avgMonthlyExpense;

    const letters = [
        { title: "Surat Keterangan Kematian", id: "kematian" },
        { title: "Surat Keterangan Tidak Mampu (SKTM)", id: "sktm" },
        { title: "Surat Pengantar Pindah Domisili", id: "pindah" },
        { title: "Surat Keterangan RT (Umum/Kelakuan Baik)", id: "umum" },
    ]

    const handleDownloadTemplate = (id: string, format: 'docx' | 'pdf') => {
        // Direct to templates folder
        const downloadPath = `/templates/surat/${id}.${format}`;
        window.open(downloadPath, '_blank');
    };

    return (
        <section id="admin" className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-4">Pusat Administrasi & Transparansi</h2>
                <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                    Akses layanan administrasi, laporan keuangan, dan template surat dengan mudah dan transparan
                </p>

                {/* Digital Services Navigation */}
                <div className="grid gap-4 md:grid-cols-3 mb-12">
                    <Link href="/surat" className="group">
                        <Card className="h-full bg-gradient-to-br from-purple-600 to-purple-800 border-0 text-white cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/25">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-4 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                                    <Folder className="h-8 w-8" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">Subfolder Administrasi</h3>
                                    <p className="text-purple-200 text-sm">Template surat & dokumen</p>
                                </div>
                                <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/surat" className="group">
                        <Card className="h-full bg-gradient-to-br from-blue-600 to-blue-800 border-0 text-white cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/25">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-4 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                                    <FileText className="h-8 w-8" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">Subfolder Surat</h3>
                                    <p className="text-blue-200 text-sm">Download template surat</p>
                                </div>
                                <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/surat/keamanan" className="group">
                        <Card className="h-full bg-gradient-to-br from-red-600 to-red-800 border-0 text-white cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/25">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-4 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                                    <Shield className="h-8 w-8" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">Laporan Keamanan</h3>
                                    <p className="text-red-200 text-sm flex items-center gap-1">
                                        <Lock className="h-3 w-3" /> Terenkripsi bcrypt
                                    </p>
                                </div>
                                <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Panel A: Ringkasan Keuangan */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                            Ringkasan Keuangan
                        </h3>
                        <Card className="bg-gradient-to-br from-background/50 to-background/80 backdrop-blur-sm border-blue-100 dark:border-blue-900 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <span className="text-9xl font-bold tracking-tighter">Rp</span>
                            </div>
                            {isAuthenticated ? (
                                <>
                                    <CardHeader>
                                        <CardTitle className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Saldo Bulan Ini</CardTitle>
                                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">Rp 2.500.000</div>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-green-500 rounded-full text-white">
                                                    <TrendingUp className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Pemasukan</p>
                                                    <p className="text-xs text-muted-foreground">Iuran & Donasi</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-green-600 dark:text-green-400">+ Rp 700.000</span>
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-red-500 rounded-full text-white">
                                                    <TrendingDown className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Pengeluaran</p>
                                                    <p className="text-xs text-muted-foreground">Kebersihan & Dana Operasional</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-red-600 dark:text-red-400">- Rp 800.000</span>
                                        </div>

                                        {/* Expense Summary Preview */}
                                        <div className="mt-2 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <BarChart3 className="h-4 w-4 text-amber-600" />
                                                    <span className="text-sm font-medium">Rata-rata Pengeluaran Bulanan</span>
                                                </div>
                                                <span className="font-bold text-amber-600">{formatCurrency(avgExpense)}</span>
                                            </div>
                                            {!loading && expenseCategories.slice(0, 3).map((cat, idx) => (
                                                <div key={idx} className="mb-2">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-muted-foreground">{cat.kategori}</span>
                                                        <span className="text-amber-600">{cat.persentase}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                                            style={{ width: `${cat.persentase}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex gap-2">
                                        <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
                                            <Link href="/keuangan/laporan">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                Laporan Bulanan
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" className="flex-1">
                                            <Link href="/keuangan/laporan">
                                                <Download className="mr-2 h-4 w-4" />
                                                Download PDF
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </>
                            ) : (
                                <>
                                    <CardHeader>
                                        <CardTitle className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Saldo Bulan Ini</CardTitle>
                                        <div className="text-4xl font-bold text-slate-300 dark:text-slate-700 mt-2 select-none tracking-widest">Rp ••••••••</div>
                                    </CardHeader>
                                    <CardContent className="grid gap-4 py-6">
                                        <div className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800">
                                            <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3 text-blue-600 dark:text-blue-400">
                                                <Lock className="h-6 w-6" />
                                            </div>
                                            <p className="text-sm font-semibold">Login untuk melihat data</p>
                                            <p className="text-xs text-muted-foreground max-w-[280px] mt-1">
                                                Rincian keuangan warga RT 04 disembunyikan demi keamanan dan privasi data lingkungan.
                                            </p>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 shadow-md">
                                            <Link href="/auth/login?redirect=/">
                                                Masuk ke Portal Warga
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </>
                            )}
                        </Card>
                    </div>

                    {/* Panel B: Layanan Surat Menyurat */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
                            Layanan Surat Menyurat
                        </h3>
                        <Card className="h-full shadow-lg border-purple-100 dark:border-purple-900">
                            <CardHeader>
                                <CardTitle>Buat atau Unduh Dokumen</CardTitle>
                                <CardDescription>Pilih jenis surat yang Anda butuhkan. Template langsung dari subfolder.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {letters.map((letter) => (
                                        <div key={letter.id} className="p-4 hover:bg-muted/50 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="font-medium text-sm sm:text-base">{letter.title}</div>
                                                <div className="flex flex-col sm:flex-end gap-2 text-right">
                                                    <Button size="sm" className="w-full sm:w-auto">
                                                        Ajukan Online
                                                    </Button>
                                                    <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                                                        <span>Template:</span>
                                                        <button
                                                            onClick={() => handleDownloadTemplate(letter.id, 'docx')}
                                                            className="flex items-center gap-1 hover:text-primary transition-colors"
                                                        >
                                                            <FileDown className="h-3 w-3" /> .docx
                                                        </button>
                                                        <span className="text-muted-foreground/30">|</span>
                                                        <button
                                                            onClick={() => handleDownloadTemplate(letter.id, 'pdf')}
                                                            className="flex items-center gap-1 hover:text-primary transition-colors"
                                                        >
                                                            <FileDown className="h-3 w-3" /> .pdf
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-4 border-t bg-muted/20 flex justify-between">
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Folder className="h-3 w-3" />
                                    <span>Path: /templates/surat/</span>
                                </div>
                                <Button variant="link" asChild className="ml-auto">
                                    <Link href="/surat">
                                        Lihat semua template...
                                        <ArrowRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}
